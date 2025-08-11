'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { countCharacters } from '@/utils/string-count/count-characters'
import { changeDisplayName } from './change-display-name.api'

type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  contactId: string // コンタクトID
  initialDisplayName: string | undefined // 初期表示名
  label: React.ReactElement // ラベル要素
  unsavedChangeTag: React.ReactElement // 未保存変更タグ要素
}

// 表示名変更のスキーマ定義
const displayNameSchema = z.object({
  displayName: z
    .string() // 文字列型
    .trim() // 前後の空白を削除
    .refine((value) => countCharacters(value) <= 255, {
      message: '255文字以下で入力してください。', // 最大255文字の制限
    }),
})

// 型推論でフォームの値の型を定義
type ChangeDisplayNameFormValue = z.infer<typeof displayNameSchema>

// 表示名エディターコンポーネント
export function DisplayNameEditor({
  currentUserId,
  contactId,
  initialDisplayName = '',
  label,
  unsavedChangeTag,
  children,
}: Props) {
  const [isPending, startTransition] = useTransition() // 送信状態の管理
  const { openErrorSnackbar } = useErrorSnackbar() // エラースナックバーの表示
  const router = useRouter() // ルーター
  const searchParams = useSearchParams() // 検索パラメータ
  const redirectLoginPath = useRedirectLoginPath({ searchParams }) // ログインページへのリダイレクトパス
  const editorRef = useRef<HTMLInputElement>(null) // エディター要素の参照

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
  } = useEditableText<ChangeDisplayNameFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialDisplayName,
    schema: displayNameSchema,
    name: 'displayName',
    shouldSaveToLocalStorage: true, // ローカルストレージに保存する
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
  const onSubmit = (data: ChangeDisplayNameFormValue) => {
    startTransition(async () => {
      const result = await changeDisplayName({ contactId, bodyData: data }) // 表示名変更APIを呼び出し
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result) // HTTPエラーの処理
        } else {
          openErrorSnackbar(result) // その他のエラーの処理
        }
      } else {
        updateField(result.contact.displayName ?? '') // 成功時はフィールドを更新
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
          <TextField
            ref={editorRef}
            type="text"
            readOnly={isPending} // 送信中は読み取り専用
            register={registerReturn}
            errors={fieldError}
          />
        }
        onFormSubmit={handleFormSubmit(onSubmit)} // フォーム送信ハンドラー
        onCancelClick={handleCancelClick} // キャンセルボタンのハンドラー
        onBlur={handleBlur(onSubmit)} // フォーカス離脱時のハンドラー
        isSubmitting={isPending} // 送信中の状態
        hasLocalStorageValue={hasLocalStorageValue} // ローカルストレージに値があるかどうか
        isEditorOpen={isEditorOpen || isPending} // エディターが開いているかどうか
        openEditor={openEditor} // エディターを開く関数
      >
        {children}
      </EditableText>
    </div>
  )
}
