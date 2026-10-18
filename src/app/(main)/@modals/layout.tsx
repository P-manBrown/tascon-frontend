import { ModalContextProvider } from "./_components/modal-context-provider";

type Props = {
  children: React.ReactNode;
};

export default function ModalsLayout({ children }: Props) {
  return <ModalContextProvider>{children}</ModalContextProvider>;
}
