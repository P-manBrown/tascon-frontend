import { fetchData } from '@/utils/api/fetch-data'

export async function deleteAccount(csrfToken: string) {
  const result = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    }
  )

  if (result instanceof Error) {
    return result
  }
}
