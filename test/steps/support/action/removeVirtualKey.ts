export default async (browser: WebdriverIO.Browser,authenticatorId: string) => {
  const authenticator = await browser.removeVirtualWebAuth(authenticatorId);
}
