'use server'

import camelcaseKeys from 'camelcase-keys'
import { revalidatePath } from 'next/cache'
import snakecaseKeys from 'snakecase-keys'
import { z } from 'zod'
import { contactSchema } from '@/schemas/response/contacts'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  contactId: string
  bodyData: {
    displayName: string
  }
}

type Data = CamelCaseKeys<z.infer<typeof contactSchema>, true>

// 表示名変更API関数
export async function changeDisplayName({ contactId, bodyData }: Params) {
  // APIリクエストを送信
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/contacts/${contactId}`, // 完全なURL
    {
      method: 'PATCH', // HTTPメソッド
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getBearerToken(), // 認証トークンを取得
      },
      body: JSON.stringify(snakecaseKeys(bodyData, { deep: false })), // リクエストボディをJSON文字列に変換
    },
  )

  let resultObject: ResultObject<Data>

  if (fetchDataResult instanceof Error) {
    resultObject = createErrorObject(fetchDataResult) // エラーオブジェクトを作成
  } else {
    const { headers, data } = fetchDataResult
    const requestId = getRequestId(headers) // レスポンスヘッダーからリクエストIDを取得
    const validateDataResult = validateData({
      requestId,
      dataSchema: contactSchema, // レスポンスの検証スキーマ
      data,
    })

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult) // バリデーションエラーの場合
    } else {
      resultObject = {
        status: 'success',
        ...camelcaseKeys(validateDataResult, { deep: true }), // snake_caseからcamelCaseに変換
      }
      // 成功時はページのキャッシュを更新
      // TODO: 以下の記述は合っているのか。`id`と`contacts`のパス両方を記述する必要はあるのか。
      revalidatePath(`/users/profile/${contactId}`) // ユーザープロフィールページのキャッシュを無効化
    }
  }

  return resultObject // 結果を返す
}
