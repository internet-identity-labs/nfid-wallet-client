import type { Selector } from "webdriverio"

/**
 * Check if the given element exists in the current DOM
 * @param  {String}   selector  Element selector
 * @param  {String}   falseCase Whether to check if the element exists or not
 */
export default async (selector: Selector, falseCase: boolean) => {
  /**
   * Elements found in the DOM
   * @type {Object}
   */
  const elements = await $$(selector)
  console.log(`==============================> ${falseCase}`);

  // await browser.pause(3000)

  if (falseCase) {
    expect(elements).toHaveLength(
      0,
      // @ts-expect-error
      `Expected element "${selector}" not to exist`,
    )
  } else {
    expect(elements.length).toBeGreaterThan(
      0,
      // @ts-expect-error
      `Expected element "${selector}" to exist`,
    )
  }
}
