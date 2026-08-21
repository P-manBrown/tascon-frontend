"use client";

import Link from "next/link";
import { useContext } from "react";
import { ModalContext } from "@/components/modal-context";
import { MobilePageTurnLinkLoadingIndicator } from "./mobile-page-turn-link-loading-indicator";

type Props = {
  page: number;
  className: string;
  children: React.ReactNode;
};

const shapeClasses = "rounded-sm";

export function MobilePageTurnLink({ page, className, children }: Props) {
  const isModal = useContext(ModalContext);
  const linkClassName = `inline-flex items-center justify-center border border-gray-300 bg-white text-gray-600 text-sm hover:bg-gray-100 ${shapeClasses} ${className}`;

  return isModal ? (
    <Link href={{ query: { page } }} className={linkClassName} prefetch={false}>
      <MobilePageTurnLinkLoadingIndicator>
        {children}
      </MobilePageTurnLinkLoadingIndicator>
    </Link>
  ) : (
    <a href={`?page=${page}`} className={linkClassName}>
      <MobilePageTurnLinkLoadingIndicator>
        {children}
      </MobilePageTurnLinkLoadingIndicator>
    </a>
  );
}

type LoadingMobilePageTurnLinkProps = {
  className: string;
};

export function LoadingMobilePageTurnLink({
  className,
}: LoadingMobilePageTurnLinkProps) {
  return <span className={`skeleton ${shapeClasses} ${className}`} />;
}
