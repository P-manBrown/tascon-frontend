import { Emoji } from "@/components/emojis/emoji";

const iconSize = 32;

type Props = {
  unified: string;
};

export function TaskGroupDetailEmoji({ unified }: Props) {
  return <Emoji unified={unified} size={iconSize} />;
}
