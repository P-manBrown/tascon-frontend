"use client";

import { useEffect, useRef } from "react";

import { consumeScrollPending } from "./scroll-pending";

type Props = {
  page: string;
};

export function UnsharedScrollAnchor({ page }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pageRef = useRef(page);

  useEffect(() => {
    const isPagePropChanged = page !== pageRef.current;
    const isPendingFromClick = consumeScrollPending();

    if (isPagePropChanged || isPendingFromClick) {
      ref.current?.scrollIntoView();
      pageRef.current = page;
    }
  }, [page]);

  return <div ref={ref} />;
}
