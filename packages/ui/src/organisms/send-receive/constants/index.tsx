import { IconCmpArrow, TabProps } from "@nfid-frontend/ui"

export const transferTabs: TabProps[] = [
  {
    title: "Send",
    name: "send",
    icon: <IconCmpArrow className="rotate-[135deg]" />,
  },
  {
    title: "Receive",
    name: "receive",
    icon: <IconCmpArrow className="-rotate-[45deg]" />,
  },
]
