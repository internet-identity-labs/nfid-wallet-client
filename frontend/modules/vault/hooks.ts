import { useAuthContext } from "frontend/flows/auth-wrapper"

export const useVault = () => {
  const { vaultActor } = useAuthContext()
  console.log(">> ", { vaultActor })
}
