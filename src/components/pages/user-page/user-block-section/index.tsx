import { DeleteBlockButton } from '@/components/cards/block-cards/delete-block-button'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { getUser } from '@/utils/api/server/get-user'
import { CreateBlockButton } from './create-block-button'

type Props = {
  userId: number
}

export async function UserBlockSection({ userId }: Props) {
  const userData = getUser(userId.toString())
  const accountData = getCurrentUser()
  const [{ user }, { account: currentUser }] = await Promise.all([
    userData,
    accountData,
  ])
  const { block } = user
  const isBlocked = block !== undefined

  return (
    <section
      className={`rounded-sm p-6 ${isBlocked ? 'border border-red-200 bg-red-50' : 'bg-gray-100'}`}
    >
      <div className="flex items-center gap-1.5">
        <DetailItemHeading>ブロック</DetailItemHeading>
        {isBlocked && (
          <span className="ml-auto rounded-full bg-red-100 px-2.5 py-0.5 text-sm text-red-800">
            ブロック中
          </span>
        )}
      </div>
      <div className="mt-4">
        {isBlocked ? (
          <p>
            このユーザーをブロックしています。
            <br />
            ブロックしているユーザーのアクションは表示されず、あなたを登録できません。
          </p>
        ) : (
          <p>
            このユーザーはブロックされていません。
            <br />
            ブロックするとユーザーのアクションは非表示になり、あなたを登録できなくなります。
          </p>
        )}
      </div>
      <div className="mt-4">
        {isBlocked ? (
          <p>ブロックを解除するには下のボタンをクリックしてください。</p>
        ) : (
          <p>ブロックするには下のボタンをクリックしてください。</p>
        )}
      </div>
      <div className="mt-6">
        {isBlocked ? (
          <DeleteBlockButton blockId={block.id} />
        ) : (
          <CreateBlockButton
            currentUserId={currentUser.id.toString()}
            userId={userId}
          />
        )}
      </div>
    </section>
  )
}
