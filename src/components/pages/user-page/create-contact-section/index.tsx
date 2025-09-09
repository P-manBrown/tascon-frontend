import Link from 'next/link'
import { CreateContactFromSuggestionButton } from '@/app/(main)/users/suggestions/_components/suggestion-cards/create-contact-from-suggestion-button'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

type Props = Pick<
  React.ComponentProps<typeof CreateContactFromSuggestionButton>,
  'userId'
> & {
  isSuggested: boolean
}

export async function CreateContactSection({ userId, isSuggested }: Props) {
  const { account: currentUser } = await getCurrentUser()

  return (
    <div className="rounded-sm bg-gray-100 p-6">
      <p>
        このユーザーは登録されていません。
        <br />
        登録すると表示名やメモが設定できるようになります。
      </p>
      {isSuggested ? (
        <>
          <p>このユーザーを登録するには下のボタンをクリックしてください。</p>
          <div className="mt-6">
            <CreateContactFromSuggestionButton
              userId={userId}
              currentUserId={currentUser.id.toString()}
            />
          </div>
        </>
      ) : (
        <>
          <p>
            このユーザーは「登録しているユーザー一覧」ページから登録できます。
          </p>
          <div className="mt-6">
            <Link href="/users/contacts" className="btn btn-success">
              登録しているユーザー一覧
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
