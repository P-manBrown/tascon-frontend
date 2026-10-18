"use client";

import { ModalContext } from "@/components/modal-context";

type Props = {
  children: React.ReactNode;
};

export function ModalContextProvider({ children }: Props) {
  return <ModalContext value={true}>{children}</ModalContext>;
}
