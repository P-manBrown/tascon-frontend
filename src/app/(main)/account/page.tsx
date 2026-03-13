import type { Metadata } from "next";
import { AccountPage } from "@/components/pages/account-page";

export const metadata: Metadata = {
  title: "アカウント",
};

export default function Account() {
  return <AccountPage />;
}
