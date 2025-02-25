import { HttpAgent, Actor } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

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

const idlFactory = ({ IDL }: any) =>
  IDL.Service({
    nonExistingMethod: IDL.Func([], [IDL.Text], ["query"]),
  })

export async function getCanisterStatus(canisterId: string) {
  try {
    const agent = await HttpAgent.create({ host: IC_HOST })

    const canister = Actor.createActor(idlFactory, {
      agent,
      canisterId: Principal.fromText(canisterId),
    })

    await canister.nonExistingMethod()
  } catch (e) {
    const error = e as Error

    if (typeof error === "object" && error !== null && "props" in error) {
      const props = error.props
      if (
        typeof props === "object" &&
        props !== null &&
        "Message" in props &&
        typeof props.Message === "string" &&
        props.Message.includes(
          "Canister has no query method 'nonExistingMethod'",
        )
      ) {
        return
      }

      throw e
    }
  }
}
