import type { EmojiClickData } from "emoji-picker-react";
import dynamic from "next/dynamic";

type Props = {
  onEmojiClick: (data: EmojiClickData) => void;
};

const NativeEmojiPicker = dynamic(
  () =>
    import("emoji-picker-react").then(({ default: Picker, EmojiStyle }) => {
      const NativeEmojiPicker = ({ onEmojiClick }: Props) => (
        <Picker
          onEmojiClick={onEmojiClick}
          emojiStyle={EmojiStyle.NATIVE}
          searchDisabled={true}
          skinTonesDisabled={true}
          previewConfig={{ showPreview: false }}
          width="100%"
        />
      );
      return NativeEmojiPicker;
    }),
  { ssr: false },
);

export function EmojiPicker({ onEmojiClick }: Props) {
  return <NativeEmojiPicker onEmojiClick={onEmojiClick} />;
}
