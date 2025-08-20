export async function moveSlider(
  slider: ChainablePromiseElement,
  moveX: number,
  moveY: number,
) {
  let sliderPos = await slider.getLocation()
  await browser.performActions([
    {
      type: "pointer",
      id: "mouse",
      parameters: { pointerType: "mouse" },
      actions: [
        { type: "pointerMove", duration: 0, x: Math.round(sliderPos.x), y: Math.round(sliderPos.y) },
        { type: "pointerDown", button: 0 },
        { type: "pointerMove", duration: 500, x: Math.round(sliderPos.x + moveX), y: Math.round(sliderPos.y + moveY) },
        { type: "pointerUp", button: 0 },
      ],
    },
  ])
}
