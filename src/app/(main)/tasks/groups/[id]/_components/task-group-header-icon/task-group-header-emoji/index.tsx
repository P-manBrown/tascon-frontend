import { Emoji } from "@/components/emojis/emoji";

const iconSize = 28;

type Props = {
  unified: string;
};

export function TaskGroupHeaderEmoji({ unified }: Props) {
  return <Emoji unified={unified} size={iconSize} />;
}
