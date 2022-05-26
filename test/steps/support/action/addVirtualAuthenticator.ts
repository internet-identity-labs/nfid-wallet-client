// import {
//  import addVirtualWebAuth from '../action/webAuth.config';
//   addVirtualWebAuth,
// } from "../../../util";


export async function addVirtualAuthenticatorsFunction(
  browser: WebdriverIO.Browser
): Promise<string> {
  return await browser.addVirtualWebAuth("ctap2", "usb", true, true);
}
