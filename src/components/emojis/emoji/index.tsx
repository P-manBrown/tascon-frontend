"use client";

import dynamic from "next/dynamic";

type Props = {
  unified: string;
  size: number;
};

const NativeEmoji = dynamic(
  () =>
    import("emoji-picker-react").then(({ Emoji: LibraryEmoji, EmojiStyle }) => {
      const NativeEmoji = ({ unified, size }: Props) => (
        <LibraryEmoji
          unified={unified}
          size={size}
          emojiStyle={EmojiStyle.NATIVE}
        />
      );
      return NativeEmoji;
    }),
  {
    loading: () => <span className="skeleton block size-full rounded-sm" />,
    ssr: false,
  },
);

export function Emoji({ unified, size }: Props) {
  return (
    <span
      className="flex shrink-0 items-center justify-center text-center leading-none"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {unified !== "" && <NativeEmoji unified={unified} size={size} />}
    </span>
  );
}
