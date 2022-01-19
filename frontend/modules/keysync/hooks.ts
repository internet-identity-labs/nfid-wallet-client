import { useAuthContext } from "frontend/flows/auth-wrapper"
import React from "react"

const PUBLIC_KEY = "PublicKey"
const PRIVATE_KEY = "PrivateKey"

export const useKeySync = () => {
  const { keysyncActor } = useAuthContext()
  console.log(">> ", { keysyncActor })

  React.useEffect(() => {}, [])
}
