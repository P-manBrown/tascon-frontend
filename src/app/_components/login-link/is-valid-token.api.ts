import { fetchData } from '@/utils/api/fetch-data'

export async function isValidToken() {
  const result = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth/validate_token`,
    {
      method: 'GET',
      credentials: 'include',
    }
  )

  const isValid = !(result instanceof Error)
  return isValid
}
