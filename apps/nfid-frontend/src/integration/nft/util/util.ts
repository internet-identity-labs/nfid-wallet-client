export function formatPrice(
  price: bigint,
  decimals: bigint,
  currency: string,
): string {
  const priceString = price.toString()
  const integerPartLength =
    priceString.length > Number(decimals)
      ? priceString.length - Number(decimals)
      : 0
  const integerPart = priceString.slice(0, integerPartLength) || "0"
  const decimalPart = priceString
    .slice(integerPartLength)
    .padStart(Number(decimals), "0")
  let formattedPrice = `${integerPart}.${decimalPart}`.replace(/\.?0+$/, "")
  if (formattedPrice.endsWith(".")) {
    formattedPrice = formattedPrice.slice(0, -1)
  }
  return `${formattedPrice} ${currency}`
}
