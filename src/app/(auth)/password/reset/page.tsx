import type { Metadata } from "next";
import { AuthHeading } from "@/components/headings/auth-heading";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "新規パスワード設定",
};

export default function ResetPassword() {
  return (
    <>
      <AuthHeading className="mb-8">新規パスワード設定</AuthHeading>
      <div className="mx-2">
        <ResetPasswordForm />
      </div>
    </>
  );
}
