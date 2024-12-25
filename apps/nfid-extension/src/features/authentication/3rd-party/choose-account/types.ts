import { ThirdPartyAuthSession } from "@nfid/integration"

import { SdkResponse } from "frontend/features/types"

export interface ApproveIcGetDelegationSdkResponse extends SdkResponse {
  authSession?: ThirdPartyAuthSession
}
