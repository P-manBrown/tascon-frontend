import { CreateContactFromSuggestionButton } from '@/components/cards/suggestion-cards/create-contact-from-suggestion-button'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { UserCreateContactForm } from './user-create-contact-form'

type Props = Pick<
  React.ComponentProps<typeof CreateContactFromSuggestionButton>,
  'contactUserId'
> & {
  isSuggested: boolean
}

export async function UserCreateContactSection({
  contactUserId,
  isSuggested,
}: Props) {
  const { account: currentUser } = await getCurrentUser()
  const currentUserId = currentUser.id.toString()

  return (
    <section className="rounded-sm bg-gray-100 p-6">
      <DetailItemHeading>登録</DetailItemHeading>
      <p className="mt-4">
        このユーザーは登録されていません。
        <br />
        登録すると表示名やメモが設定できるようになります。
      </p>
      <div className="mt-4">
        {isSuggested ? (
          <p>登録するには下のボタンをクリックしてください。</p>
        ) : (
          <p>
            登録するには下のフォームにこのユーザーのメールアドレスを入力してください。
          </p>
        )}
        <div className="mt-6">
          {isSuggested ? (
            <CreateContactFromSuggestionButton
              contactUserId={contactUserId}
              currentUserId={currentUserId}
            />
          ) : (
            <UserCreateContactForm
              contactUserId={contactUserId}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </div>
    </section>
  )
}
