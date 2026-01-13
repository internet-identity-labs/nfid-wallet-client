import { ReactNode } from "react"
import { IcpNetworkIcon } from "@nfid/ui/atoms/icons/IcpNetworkIcon"
import { EthNetworkIcon } from "@nfid/ui/atoms/icons/EthNetworkIcon"
import { BtcNetworkIcon } from "@nfid/ui/atoms/icons/BtcNetworkIcon"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { ArbNetworkIcon } from "@nfid/ui/atoms/icons/ArbNetworkIcon"
import { BaseNetworkIcon } from "@nfid/ui/atoms/icons/BaseNetworkIcon"
import { BnbNetworkIcon } from "@nfid/ui/atoms/icons/BnbNetworkIcon"
import { PolNetworkIcon } from "@nfid/ui/atoms/icons/PolNetworkIcon"

export const getNetworkIcon = (
  chainId: ChainId,
  isDark: boolean,
  size?: number,
): ReactNode => {
  switch (chainId) {
    case ChainId.ICP:
      return <IcpNetworkIcon color={isDark ? "white" : "black"} size={size} />

    case ChainId.ETH:
      return <EthNetworkIcon color={isDark ? "white" : "black"} size={size} />

    case ChainId.BTC:
      return <BtcNetworkIcon color={isDark ? "white" : "black"} size={size} />

    case ChainId.ARB:
      return <ArbNetworkIcon color={isDark ? "white" : "black"} size={size} />

    case ChainId.BASE:
      return <BaseNetworkIcon color={isDark ? "white" : "black"} size={size} />

    case ChainId.BNB:
      return <BnbNetworkIcon color={isDark ? "white" : "black"} size={size} />

    case ChainId.POL:
      return <PolNetworkIcon color={isDark ? "white" : "black"} size={size} />

    default:
      return <IcpNetworkIcon color={isDark ? "white" : "black"} size={size} />
  }
}
