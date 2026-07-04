import { LoadingContactNote } from "@/components/cards/contact-cards/contact-note";
import { LoadingUserCard } from "@/components/cards/user-card";
import { EmptyList } from "@/components/empty-list";
import { Pagination } from "@/components/paginations";
import { getContacts } from "@/utils/api/get-contacts";
import { getTaskGroup } from "@/utils/api/get-task-group";
import { getCurrentUser } from "@/utils/api/server/get-current-user";
import { ShareTaskGroupContactCard } from "../share-task-group-contact-card";

type Props = {
  taskGroupId: string;
  page: string;
};

const cardsLayoutClasses = "grid gap-4 lg:grid-cols-2 xl:grid-cols-3";
const contactListCardCount = 20;

export default async function ShareTaskGroupContactList({
  taskGroupId,
  page,
}: Props) {
  const [{ account: currentUser }, { taskGroup }] = await Promise.all([
    getCurrentUser(),
    getTaskGroup(taskGroupId),
  ]);
  const { contacts, pagination } = await getContacts({
    page,
    currentUserId: currentUser.id.toString(),
    limit: contactListCardCount.toString(),
  });

  const sharedUserIds = new Set(taskGroup.sharedUsers.map((user) => user.id));

  return (
    <div>
      {contacts.length === 0 ? (
        <div className="my-28 md:my-48">
          <EmptyList description="ユーザーが登録されていません" />
        </div>
      ) : (
        <div className={cardsLayoutClasses}>
          {contacts.map((contact) => (
            <ShareTaskGroupContactCard
              key={contact.id}
              contactUser={contact.contactUser}
              displayName={contact.displayName}
              note={contact.note}
              taskGroupId={taskGroupId}
              taskGroupName={taskGroup.name}
              isShared={sharedUserIds.has(contact.contactUser.id)}
            />
          ))}
        </div>
      )}
      <div className="mt-6">
        <Pagination
          currentPage={pagination.currentPage}
          pageItems={contacts.length}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
        />
      </div>
    </div>
  );
}

export function LoadingShareTaskGroupContactList() {
  return (
    <div className={cardsLayoutClasses}>
      {Array.from({ length: contactListCardCount }, (_, index) => index).map(
        (index) => (
          <LoadingUserCard key={index}>
            <LoadingContactNote />
          </LoadingUserCard>
        ),
      )}
    </div>
  );
}
