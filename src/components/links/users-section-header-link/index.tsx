import type { LinkProps } from "next/link";
import Link from "next/link";

type Props = Pick<LinkProps, "href">;

export function UsersSectionHeaderLink({ href }: Props) {
  return (
    <Link href={href} className="link text-sm">
      一覧ページへ
    </Link>
  );
}
