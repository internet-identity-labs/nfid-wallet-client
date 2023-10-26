import {demoAppPage} from "./demoApp-page.js";

export class DemoUpdateDelegation extends demoAppPage {

  get getUpdateDelegationButton(){
    return $('#buttonUpdateDelegation')
  }

  async updateDelegation(targets: string, derivation: string){
    await this.getDerivationOriginInput("updateDelegation").setValue(derivation)
    await super.addCanisterID("updateDelegation", targets)
    await this.getUpdateDelegationButton.click()
    await browser.pause(6000)
  }
}

export default new DemoUpdateDelegation()
