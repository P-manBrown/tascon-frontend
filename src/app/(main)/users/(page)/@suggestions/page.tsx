import { FaceSmileIcon } from '@heroicons/react/24/solid'
import { Suspense } from 'react'
import { EmptyList } from '@/components/empty-list'
import { UsersSectionHeading } from '@/components/headings/users-section-heading'
import { UsersSectionHeaderLayout } from '@/components/layouts/users-section-header-layout'
import { UsersSectionHeadingLayout } from '@/components/layouts/users-section-heading-layout'
import { UsersSectionHeaderLink } from '@/components/links/users-section-header-link'
import { SuggestionsCardsCollapsibleSection } from './_components/suggestions-cards-collapsible-section'
import {
  LoadingSuggestionsItemCountSummary,
  SuggestionsItemCountSummary,
} from './_components/suggestions-item-count-summary'
import {
  LoadingUsersSuggestionList,
  UsersSuggestionList,
} from './_components/users-suggestion-list'

const limit = 12

export default function UsersSuggestions() {
  return (
    <section>
      <UsersSectionHeaderLayout>
        <UsersSectionHeadingLayout>
          <UsersSectionHeading icon={<FaceSmileIcon className="size-5" />}>
            関係のあるユーザー
          </UsersSectionHeading>
          <Suspense fallback={<LoadingSuggestionsItemCountSummary />}>
            <SuggestionsItemCountSummary limit={limit} />
          </Suspense>
        </UsersSectionHeadingLayout>
        <UsersSectionHeaderLink href="/users/suggestions" />
      </UsersSectionHeaderLayout>
      <SuggestionsCardsCollapsibleSection>
        <div className="p-4">
          <Suspense fallback={<LoadingUsersSuggestionList />}>
            <UsersSuggestionList
              fallback={
                <div className="my-28">
                  <EmptyList description="関係のあるユーザーは存在しません。" />
                </div>
              }
            />
          </Suspense>
        </div>
      </SuggestionsCardsCollapsibleSection>
    </section>
  )
}
