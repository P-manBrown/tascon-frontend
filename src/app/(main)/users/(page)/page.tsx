import type { Metadata } from "next";
import { UsersHeading } from "@/components/headings/users-heading";
import { UsersHeaderLayout } from "@/components/layouts/users-header-layout";

export const metadata: Metadata = {
  title: "ユーザー一覧",
};

export default function UsersPage() {
  return (
    <div>
      <UsersHeaderLayout>
        <UsersHeading>ユーザー一覧</UsersHeading>
      </UsersHeaderLayout>
    </div>
  );
}
