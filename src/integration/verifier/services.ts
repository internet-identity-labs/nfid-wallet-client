import { getPhoneCredential } from "."

export async function generateCredential({ token }: { token?: number[] }) {
  if (!token) throw new Error("Missing token")
  console.debug(generateCredential.name, { token })
  return getPhoneCredential(token)
}
