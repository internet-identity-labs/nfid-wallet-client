import { TOKEN_CANISTER } from "./constants"
import { getMetadata, TokenMetadata } from "./get-metadata"

const mapToToken = ({ decimals, ...rest }: TokenMetadata) => ({
  decimals,
  toPresentation: (value = BigInt(0)) => {
    return Number(value) / Number(BigInt(10 ** decimals))
  },
  transformAmount: (value: string) =>
    Number(parseFloat(value) * 10 ** decimals),
  ...rest,
})

export async function getAllToken() {
  return await Promise.all(TOKEN_CANISTER.map(getMetadata)).then((token) =>
    token.map(mapToToken),
  )
}
