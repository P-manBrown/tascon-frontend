import { ShareTaskGroupModal } from "./_components/share-task-group-modal";

type Props = {
  children: React.ReactNode;
};

export default function ShareTaskGroupModalLayout({ children }: Props) {
  return (
    <ShareTaskGroupModal>
      <div className="w-full md:w-250">{children}</div>
    </ShareTaskGroupModal>
  );
}
