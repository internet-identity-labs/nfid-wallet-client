// REFERENCE:
// https://internetcomputer.org/docs/current/references/cli-reference/dfx-ledger/#options
export const E8S = 10 ** 8

export const stringICPtoE8s = (value: string) => {
  return Number(parseFloat(value) * E8S)
}

export const e8sICPToString = (value: number) => `${value / E8S}`
