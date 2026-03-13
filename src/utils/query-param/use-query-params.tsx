import { type ReadonlyURLSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

type Params = {
  searchParams: ReadonlyURLSearchParams | null;
};

export function useQueryParams({ searchParams }: Params) {
  const pathname = usePathname();

  const cleanupQueryParams = useCallback(
    (keys: string[]) => {
      const params = new URLSearchParams(searchParams?.toString());
      keys.forEach((key) => {
        params.delete(key);
      });
      const newParams = params.toString();

      const newUrl = newParams ? `${pathname}?${newParams}` : pathname;

      history.replaceState(null, "", newUrl);
    },
    [pathname, searchParams],
  );

  return { cleanupQueryParams };
}
