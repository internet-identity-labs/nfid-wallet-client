import { IconCmpArrow, IconCmpSwapActivity } from "@nfid/ui/atoms/icons"

import { IActivityAction } from "@nfid/integration/token/icrc1/types"

export const getActionOptions = (action: IActivityAction) => {
  switch (action) {
    case "Sent":
      return {
        color: "bg-red-50",
        icon: (
          <IconCmpArrow className="text-gray-400 rotate-[135deg] text-red-600" />
        ),
      }
    case "Received":
      return {
        color: "bg-emerald-50",
        icon: (
          <IconCmpArrow className="text-gray-400 rotate-[-45deg] !text-emerald-600" />
        ),
      }
    case "Swap":
      return { color: "bg-violet-50", icon: <IconCmpSwapActivity /> }
    default:
      return {
        color: "bg-red-50",
        icon: (
          <IconCmpArrow className="text-gray-400 rotate-[135deg] text-red-600" />
        ),
      }
  }
}
