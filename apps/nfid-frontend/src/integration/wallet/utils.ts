import { E8S } from "@nfid/integration/token/constants"

export const stringICPtoE8s = (value: string) => {
  return Number(parseFloat(value) * E8S)
}

export const e8sICPToString = (value: number) => `${value / E8S}`
