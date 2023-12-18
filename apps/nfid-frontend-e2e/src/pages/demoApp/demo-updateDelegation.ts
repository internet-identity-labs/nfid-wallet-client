import {demoAppPage} from "./demoApp-page.js";

export class DemoUpdateDelegation extends demoAppPage {

  get getUpdateDelegationButton(){
    return $('#buttonUpdateDelegation')
  }

  async updateDelegation(targets: string, derivation?: string){
    if (derivation) await this.getDerivationOriginInput("updateDelegation").setValue(derivation)
    await super.addCanisterID("updateDelegation", targets)
    await this.getUpdateDelegationButton.click()
  }
}

export default new DemoUpdateDelegation()
