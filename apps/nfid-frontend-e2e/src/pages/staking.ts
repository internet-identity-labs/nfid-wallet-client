import { Page } from "./page.js"

export class Staking extends Page {
  get stakeButton() {
    return $("#profileStakeButton")
  }

  get stakeTokensButton() {
    return $("#stakeTokensButton")
  }

  get successTitle() {
    return $("#stakingProcessTitle")
  }

  get closeButton() {
    return $("#stake-success-close-button")
  }

  get lockTimePeriod() {
    return $("#lock-time-period")
  }

  async stakingBalances(
    category: "stakingBalance" | "stakedAmount" | "stakingRewards",
  ) {
    const text = await $(`//p[@id='${category}']/p[1]`).getText()
    return {
      number: async () => {
        return text.split(" ")[0]
      },
      currency: async () => {
        return text.split(" ")[1]
      },
      full: async () => {
        return text.trim()
      },
    }
  }

  stakedToken = (tokenName: string) => ({
    base: $(`#stakedToken_${tokenName}`),
    symbolName: $(`#stakedToken_${tokenName} #tokenSymbol`),
    name: $(`#stakedToken_${tokenName} #tokenName`),
    stakedAmount: $(`#stakedToken_${tokenName} #tokenStakedAmount`),
    rewards: $(`#stakedToken_${tokenName} #tokenRewards`),
    detailsButton: $(`#stakedToken_${tokenName} #tokenStakingDetailsButton`),
  })
}

export default new Staking()
