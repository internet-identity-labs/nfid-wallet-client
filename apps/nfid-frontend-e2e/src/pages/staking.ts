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
    let text: string
    await browser.waitUntil(async () => {
      text = await $(`//p[@id='${category}']/p[1]`).getText()
      return text != "" && text != undefined
    })

    return {
      number: async () => {
        return text.split(" ")[0].trim()
      },
      currency: async () => {
        return text.split(" ")[1].trim()
      },
      full: async () => {
        return text.trim()
      },
    }
  }

  stakedToken = (tokenName: string) => ({
    symbolName: $(`#stakedToken_${tokenName} #tokenSymbol`),
    name: $(`#stakedToken_${tokenName} #tokenName`),
    stakedAmount: $(`#stakedToken_${tokenName} #tokenStakedAmount`),
    rewards: $(`#stakedToken_${tokenName} #tokenRewards`),
    detailsButton: $(`#stakedToken_${tokenName} #tokenStakingDetailsButton`),
  })

  StakedTokenTransaction = (
    tableType: "Locked" | "Unlocking",
    tokenName?: string,
    ID?: string,
  ) => ({
    getFirstRowInTable: $(`(//div[@id='stakingDetails-${tableType}-table']//p[@id='token'])[1]/ancestor::tr`),
    firstTransactionTokenID: $(`(//div[@id='stakingDetails-${tableType}-table']//tr[@id='stakedTokenTransaction_${tokenName}'])[1]//p[@id='token']`),
    initialStake: $(`//div[@id='stakingDetails-${tableType}-table']//tr[@id='stakedTokenTransaction_${tokenName}'][.//p[@id='token'][normalize-space(.)='${ID}']]//p[@id='tokenInitialStake']`),
    rewards: $(`//div[@id='stakingDetails-${tableType}-table']//tr[@id='stakedTokenTransaction_${tokenName}'][.//p[@id='token'][normalize-space(.)='${ID}']]//p[@id='tokenRewards']`),
    lockTime: $(`//div[@id='stakingDetails-${tableType}-table']//tr[@id='stakedTokenTransaction_${tokenName}'][.//p[@id='token'][normalize-space(.)='${ID}']]//p[@id='tokenLockTime']`),
    unlockTime: $(`//div[@id='stakingDetails-${tableType}-table']//tr[@id='stakedTokenTransaction_${tokenName}'][.//p[@id='token'][normalize-space(.)='${ID}']]//p[@id='tokenUnlockTime']`),
    transactionDetailsButton: $(`//div[@id='stakingDetails-${tableType}-table']//tr[@id='stakedTokenTransaction_${tokenName}'][.//p[@id='token'][normalize-space(.)='${ID}']]//p[@id='tokenStakingDetailsButton']`),
    getAllTableTransactionsIDs: $$(`#stakingDetails-${tableType}-table #token`),
    findTransactionByID: $(`//div[@id='stakingDetails-${tableType}-table']//tr[.//p[@id='token'][normalize-space(.)='${ID}']]`),
  })

  sidePanel = () => ({
    stakeID: $("#sidePanel-stakeID"),
    initialStake: $("#sidePanel-initialStake"),
    rewards: $("#sidePanel-rewards"),
    totalValue: $("#sidePanel-totalValue"),
    dateCreated: $("#sidePanel-dateCreated"),
    lockTime: $("#sidePanel-lockTime"),
    unlockTime: $("#sidePanel-unlockTime"),
    startActionButton: $("#sidePanel-lock_unlock_Button"),
  })
}

export default new Staking()
