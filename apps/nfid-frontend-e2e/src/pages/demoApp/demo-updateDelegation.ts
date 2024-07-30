import { demoAppPage } from "./demoApp-page.js"

export class DemoUpdateDelegation extends demoAppPage {
  get getUpdateDelegationButton() {
    return $("#buttonUpdateDelegation")
  }

  async updateDelegation(targets: string, derivation?: string) {
    if (derivation)
      await this.getDerivationOriginInput("updateDelegation").then(async(it)=>{
        await it.waitForClickable()
        await it.click()
      })
    await super.addCanisterID("updateDelegation", targets)
    await this.getUpdateDelegationButton.then(async(it)=>{
      await it.waitForClickable()
      await it.click()
    })
  }
}

export default new DemoUpdateDelegation()
