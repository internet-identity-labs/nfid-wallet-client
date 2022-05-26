export default async () => {
  const key = await browser.addVirtualWebAuth("ctap2", "usb", true, true);
  console.log('Adding virtual key', key);
}
