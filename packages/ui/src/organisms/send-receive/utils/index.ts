import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import Fail from "../assets/error.json"
import Success1 from "../assets/success_1.json"
import Success2 from "../assets/success_2.json"
import Success3 from "../assets/success_3.json"
import Success4 from "../assets/success_4.json"

export enum Step {
  Transfer,
  Deposit,
  Swap,
  Withdraw,
  Completed,
  Error,
}

const allAnimations = [Success1, Success2, Success3, Success4, Fail]

export const getTokenOptions = async (tokens: FT[]) => {
  return await Promise.all(
    tokens.map(async (token) => {
      const usdBalance = await token.getTokenRate(
        token.getTokenBalanceFormatted() || "0",
      )

      return {
        label: token.getTokenName(),
        options: [
          {
            icon: token.getTokenLogo(),
            value: token.getTokenAddress(),
            title: token.getTokenSymbol(),
            subTitle: token.getTokenName(),
            innerTitle: `${
              token.getTokenBalanceFormatted() || 0
            } ${token.getTokenSymbol()}`,
            innerSubtitle:
              usdBalance === undefined
                ? "Not listed"
                : usdBalance === 0
                ? "0.00 USD"
                : `${usdBalance.toString()} USD`,
          },
        ],
      }
    }),
  )
}

export const getTokenOptionsVault = async (tokens: FT[]) => {
  const options = await getTokenOptions(tokens)
  return options.filter((option) => option.options[0].value === ICP_CANISTER_ID)
}

export const animationsByStep = {
  [Step.Transfer]: allAnimations[0],
  [Step.Deposit]: allAnimations[0],
  [Step.Swap]: allAnimations[1],
  [Step.Withdraw]: allAnimations[2],
  [Step.Completed]: allAnimations[3],
  [Step.Error]: allAnimations[4],
}

export const getAnimationByStep = (step: Step) => {
  return animationsByStep[step] || allAnimations[0]
}
