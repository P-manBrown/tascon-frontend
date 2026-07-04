"use client";

import Link from "next/link";
import { useContext } from "react";
import { ModalContext } from "@/components/modal-context";
import { DesktopPaginationLinkLoadingIndicator } from "./desktop-pagination-link-loading-indicator";

type Props = {
  page: number;
  className: string;
  children: React.ReactNode;
};

export function DesktopPaginationLink({ page, className, children }: Props) {
  const isModal = useContext(ModalContext);
  const linkClassName = `border border-gray-300 bg-white text-gray-600 text-sm hover:bg-gray-100 focus-visible:z-10 ${className}`;

  return isModal ? (
    <Link href={{ query: { page } }} className={linkClassName} prefetch={false}>
      <DesktopPaginationLinkLoadingIndicator>
        {children}
      </DesktopPaginationLinkLoadingIndicator>
    </Link>
  ) : (
    <a href={`?page=${page}`} className={linkClassName}>
      <DesktopPaginationLinkLoadingIndicator>
        {children}
      </DesktopPaginationLinkLoadingIndicator>
    </a>
  );
}
