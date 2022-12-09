import { TOKEN_CANISTER } from "./constants"
import { getMetadata } from "./get-metadata"

export async function getAllToken() {
  return await Promise.all(TOKEN_CANISTER.map(getMetadata))
}
