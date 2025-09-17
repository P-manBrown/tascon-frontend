import { UserCircleIcon } from '@heroicons/react/24/solid'
import { Suspense } from 'react'
import { EmptyList } from '@/components/empty-list'
import { UsersSectionHeading } from '@/components/headings/users-section-heading'
import { UsersSectionHeaderLayout } from '@/components/layouts/users-section-header-layout'
import { UsersSectionHeadingLayout } from '@/components/layouts/users-section-heading-layout'
import { UsersSectionHeaderLink } from '@/components/links/users-section-header-link'
import { ContactsCardsCollapsibleSection } from './_components/contact-cards-collapsible-section'
import {
  ContactsItemCountSummary,
  LoadingContactsItemCountSummary,
} from './_components/contacts-item-count-summary'
import {
  LoadingUsersContactList,
  UsersContactList,
} from './_components/users-contact-list'

const limit = 12

export default function UsersContacts() {
  return (
    <section>
      <UsersSectionHeaderLayout>
        <UsersSectionHeadingLayout>
          <UsersSectionHeading icon={<UserCircleIcon className="size-5" />}>
            登録しているユーザー
          </UsersSectionHeading>
          <Suspense fallback={<LoadingContactsItemCountSummary />}>
            <ContactsItemCountSummary limit={limit} />
          </Suspense>
        </UsersSectionHeadingLayout>
        <UsersSectionHeaderLink href="/users/contacts" />
      </UsersSectionHeaderLayout>
      <ContactsCardsCollapsibleSection>
        <div className="p-4">
          <Suspense fallback={<LoadingUsersContactList limit={limit} />}>
            <UsersContactList
              limit={limit.toString()}
              fallback={
                <div className="my-36">
                  <EmptyList description="登録しているユーザーは存在しません。" />
                </div>
              }
            />
          </Suspense>
        </div>
      </ContactsCardsCollapsibleSection>
    </section>
  )
}
