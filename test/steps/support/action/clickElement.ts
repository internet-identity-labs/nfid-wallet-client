import { Selector } from "webdriverio"

import checkIfElementExists from "../check/checkIfElementExists"
import isEnabled from "../check/isEnabled"

/**
 * Perform an click action on the given element
 * @param  {String}   action  The action to perform (click or doubleClick)
 * @param  {String}   type    Type of the element (link or selector)
 * @param  {String}   selector Element selector
 */
export default async (
  action: "click" | "doubleClick",
  type: "link" | "selector",
  selector: Selector,
) => {
  /**
   * Element to perform the action on
   * @type {String}
   */
  //  isEnabled(selector, false);

  const selector2 = type === "link" ? `=${selector}` : selector

  /**
   * The method to call on the browser object
   * @type {String}
   */
  const method = action === "click" ? "click" : "doubleClick"

  await checkIfElementExists(selector2)

  await browser.pause(4000);
  await $(selector2)[method]()
}
