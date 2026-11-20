// See https://is.gd/4CpzNm

import type { ReadonlyURLSearchParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

type Props = {
  onParamsReceived: (searchParams: ReadonlyURLSearchParams) => void;
};

export function SearchParamsLoader(props: Props) {
  return (
    <Suspense>
      {/* Forwarding the typed props to the underlying element is intended. */}
      {/* nosemgrep: react-props-spreading */}
      <SearchParamsLoaderInner {...props} />
    </Suspense>
  );
}

function SearchParamsLoaderInner({ onParamsReceived }: Props) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onParamsReceived(searchParams);
  }, [onParamsReceived, searchParams]);

  return null;
}
