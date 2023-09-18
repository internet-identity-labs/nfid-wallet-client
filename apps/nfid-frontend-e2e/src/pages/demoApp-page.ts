import {Page} from "./page.js"

export class demoAppPage extends Page {

  public demoAppBaseUrl = process.env.NFID_DEMO_URL
    ? process.env.NFID_DEMO_URL
    : "http://localhost:4200"

  get updateIframeButton() {
    return $('#updateIframe')
  }

  get getPrincipalIdSelector() {
    return $('#principalID')
  }

  get getAnonymousProfiles() {
    return $('#profileID')
  }

  get getPublicProfile() {
    return $('//div[contains(.,\'NFID\') and contains(@id,\'publicProfileID\')]')
  }
}

export default new demoAppPage()
