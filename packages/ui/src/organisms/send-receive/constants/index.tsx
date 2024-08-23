import { IconCmpArrow, ITab } from "@nfid-frontend/ui"

export const transferTabs: ITab[] = [
  {
    label: "Send",
    value: "send",
    icon: <IconCmpArrow className="rotate-[135deg]" />,
  },
  {
    label: "Receive",
    value: "receive",
    icon: <IconCmpArrow className="-rotate-[45deg]" />,
  },
]
