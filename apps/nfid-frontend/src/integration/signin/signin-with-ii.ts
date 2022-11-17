import { AuthClient } from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"

declare const II_PROVIDER: string

export const signinWithII = async () => {
  const authClient = await AuthClient.create()
  return new Promise(async (resolve, reject) => {
    authClient.login({
      onSuccess: () => {
        const delegation = authClient.getIdentity() as DelegationIdentity
        resolve(delegation)
      },
      onError: (error) => {
        console.error(error)
        reject()
      },
      identityProvider: `${II_PROVIDER}/#authorize`,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
    })
  })
}
