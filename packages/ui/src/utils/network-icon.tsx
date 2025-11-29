import { ReactNode } from "react"
import { IcpNetworkIcon } from "../atoms/icons/IcpNetworkIcon"
import { EthNetworkIcon } from "../atoms/icons/EthNetworkIcon"
import { BtcNetworkIcon } from "../atoms/icons/BtcNetworkIcon"
import { useDarkTheme } from "frontend/hooks"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { ArbNetworkIcon } from "../atoms/icons/ArbNetworkIcon"
import { BaseNetworkIcon } from "../atoms/icons/BaseNetworkIcon"
import { BnbNetworkIcon } from "../atoms/icons/BnbNetworkIcon"
import { PolNetworkIcon } from "../atoms/icons/PolNetworkIcon"

export const getNetworkIcon = (chainId: ChainId): ReactNode => {
  const isDarkTheme = useDarkTheme()

  switch (chainId) {
    case ChainId.ICP:
      return <IcpNetworkIcon color={isDarkTheme ? "white" : "black"} />

    case ChainId.ETH:
      return <EthNetworkIcon color={isDarkTheme ? "white" : "black"} />

    case ChainId.BTC:
      return <BtcNetworkIcon color={isDarkTheme ? "white" : "black"} />

    case ChainId.ARB:
      return <ArbNetworkIcon color={isDarkTheme ? "white" : "black"} />

    case ChainId.BASE:
      return <BaseNetworkIcon color={isDarkTheme ? "white" : "black"} />

    case ChainId.BNB:
      return <BnbNetworkIcon color={isDarkTheme ? "white" : "black"} />

    case ChainId.POL:
      return <PolNetworkIcon color={isDarkTheme ? "white" : "black"} />

    default:
      return <IcpNetworkIcon color={isDarkTheme ? "white" : "black"} />
  }
}
