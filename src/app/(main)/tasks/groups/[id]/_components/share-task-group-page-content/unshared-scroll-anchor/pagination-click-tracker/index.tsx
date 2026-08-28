"use client";

import { markScrollPending } from "../scroll-pending";

type Props = {
  children: React.ReactNode;
};

export function PaginationClickTracker({ children }: Props) {
  const handleClickCapture = (ev: React.MouseEvent) => {
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
      return;
    }
    if (ev.target instanceof Element && ev.target.closest("a")) {
      markScrollPending();
    }
  };

  return <div onClickCapture={handleClickCapture}>{children}</div>;
}
