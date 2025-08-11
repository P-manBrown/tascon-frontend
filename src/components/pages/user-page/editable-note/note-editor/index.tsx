'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-text'
import { useEditableMultiLineText } from '@/components/editable-text/use-editable-multi-line-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextArea } from '@/components/form-controls/text-area'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { countCharacters } from '@/utils/string-count/count-characters'
import { changeNote } from './change-note.api'

type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  contactId: string // コンタクトID
  initialNote: string | undefined // 初期メモ内容
  label: React.ReactElement // ラベル要素
  unsavedChangeTag: React.ReactElement // 未保存変更タグ要素
}

// メモ変更のスキーマ定義
const noteSchema = z.object({
  note: z
    .string() // 文字列型
    .trim() // 前後の空白を削除
    .refine((value) => countCharacters(value) <= 1000, {
      message: '最大文字数を超えています。',
    }),
})

// 型推論でフォームの値の型を定義
type ChangeNoteFormValue = z.infer<typeof noteSchema>

// メモエディターコンポーネント
export function NoteEditor({
  currentUserId,
  contactId,
  initialNote = '',
  label,
  unsavedChangeTag,
  children,
}: Props) {
  const [isPending, startTransition] = useTransition() // 送信状態の管理
  const { openErrorSnackbar } = useErrorSnackbar() // エラースナックバーの表示
  const router = useRouter() // ルーター
  const searchParams = useSearchParams() // 検索パラメータ
  const redirectLoginPath = useRedirectLoginPath({ searchParams }) // ログインページへのリダイレクトパス
  const editorRef = useRef<HTMLTextAreaElement>(null) // エディター要素の参照

  // 編集可能テキストのカスタムフック
  const {
    updateField,
    isEditorOpen,
    hasLocalStorageValue,
    handleFormSubmit,
    handleCancelClick,
    handleBlur,
    registerReturn,
    fieldError,
    saveFieldValueToLocalStorage,
    openEditor,
  } = useEditableText<ChangeNoteFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialNote,
    schema: noteSchema,
    name: 'note',
    shouldSaveToLocalStorage: true, // ローカルストレージに保存する
  })

  // 複数行テキスト用のカスタムフック
  const { shadowRef, wordCount, handleInput } = useEditableMultiLineText({
    editorRef,
    isEditorOpen,
  })

  // HTTPエラーの処理
  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      saveFieldValueToLocalStorage() // ローカルストレージに値を保存
      router.push(redirectLoginPath) // ログインページにリダイレクト
    } else {
      openErrorSnackbar(err) // エラースナックバーを表示
    }
  }

  // フォーム送信処理
  const onSubmit = (data: ChangeNoteFormValue) => {
    startTransition(async () => {
      const result = await changeNote({ contactId, bodyData: data }) // メモ変更APIを呼び出し
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result) // HTTPエラーの処理
        } else {
          openErrorSnackbar(result) // その他のエラーの処理
        }
      } else {
        updateField(result.contact.note ?? '') // 成功時はフィールドを更新
      }
    })
  }

  return (
    <div>
      <DetailItemHeadingLayout>
        {label}
        {/* 未保存の変更がある場合にタグを表示 */}
        {hasLocalStorageValue && unsavedChangeTag}
      </DetailItemHeadingLayout>
      <EditableText
        editor={
          <TextArea
            ref={editorRef}
            shadowRef={shadowRef} // テキストエリア自動リサイズ用の影要素
            rows={6} // 初期行数
            readOnly={isPending} // 送信中は読み取り専用
            wordCount={wordCount} // 文字数カウント
            maxCount={1000} // 最大文字数
            register={registerReturn}
            errors={fieldError}
            onInput={handleInput} // 入力時のハンドラー
            placeholder="メモを入力してください"
          />
        }
        isEditorOpen={isEditorOpen || isPending} // エディターが開いているかどうか
        isSubmitting={isPending} // 送信中の状態
        hasLocalStorageValue={hasLocalStorageValue} // ローカルストレージに値があるかどうか
        onFormSubmit={handleFormSubmit(onSubmit)} // フォーム送信ハンドラー
        onCancelClick={handleCancelClick} // キャンセルボタンのハンドラー
        onBlur={handleBlur(onSubmit)} // フォーカス離脱時のハンドラー
        openEditor={openEditor} // エディターを開く関数
      >
        {children}
      </EditableText>
    </div>
  )
}
