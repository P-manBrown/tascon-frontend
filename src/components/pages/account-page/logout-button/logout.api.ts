import { fetchData } from '@/utils/api/fetch-data'

export async function logout(csrfToken: string) {
  const result = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth/sign_out`,
    {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    }
  )

  if (result instanceof Error) {
    return result
  }
}
