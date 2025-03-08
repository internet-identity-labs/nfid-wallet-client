import { useActor } from "@xstate/react"
import clsx from "clsx"
import { Staking } from "packages/ui/src/organisms/staking"
import { useCallback, useContext, useState, useEffect } from "react"

import { Button } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"
import { NFT } from "frontend/integration/nft/nft"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"

const StakingPage = () => {
  return <Staking />
}

export default StakingPage
