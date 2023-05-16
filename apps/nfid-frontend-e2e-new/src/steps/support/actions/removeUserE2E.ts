/**
 * Remove user E2E.
 */
import fetch from "node-fetch"

export default async () => {
  let userUrlE2E = process.env.URL_AWS_USER_E2E_GOOGLE
  if (userUrlE2E) {
    await fetch(userUrlE2E, { method: "DELETE", body: "{}" })
  } else {
    throw Error(`URL_AWS_USER_E2E_GOOGLE is not defined.`)
  }
}
