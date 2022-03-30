import { HttpAgent, HttpAgentOptions } from "@dfinity/agent"

export const getAgent = (options: HttpAgentOptions) => {
  const agent = new HttpAgent({ ...options })

  // Fetch root key for certificate validation during development
  if (process.env.NEXT_PUBLIC_ENV !== "production") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running",
      )
      console.error(err)
    })
  }
  return agent
}
