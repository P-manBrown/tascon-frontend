const scrollPendingStorageKey = "share-task-group:pending-scroll-to-unshared";

export function markScrollPending() {
  sessionStorage.setItem(scrollPendingStorageKey, "1");
}

export function consumeScrollPending() {
  const isPending = sessionStorage.getItem(scrollPendingStorageKey) !== null;

  if (isPending) {
    sessionStorage.removeItem(scrollPendingStorageKey);
  }

  return isPending;
}
