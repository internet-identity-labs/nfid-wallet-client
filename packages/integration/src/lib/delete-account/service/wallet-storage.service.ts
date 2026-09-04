import { walletStorage } from "../../authentication/storage"
import { deserializeUserIdData } from "../../authentication/user-id-data"
import { Plan } from "../dto/plan.dto"

export const walletStorageService = {
  async clearLocalWalletProfiles(account: Plan["account"]): Promise<void> {
    await removeProfileEntriesByAnchor(account.anchor)
    await removeDeviceCredentialIds(account)
  },
}

async function removeProfileEntriesByAnchor(anchor: bigint): Promise<void> {
  const storageKeys = await walletStorage.getAllKeys()
  const profileKeysToRemove: string[] = []

  for (const profileKey of storageKeys.filter((storageKey) =>
    storageKey.startsWith("user_profile_data_"),
  )) {
    const serializedProfile = await walletStorage.get(profileKey)
    if (!serializedProfile) continue
    try {
      if (deserializeUserIdData(serializedProfile as string).anchor === anchor)
        profileKeysToRemove.push(profileKey)
    } catch {}
  }

  if (profileKeysToRemove.length)
    await walletStorage.removeAll(profileKeysToRemove)
}

async function removeDeviceCredentialIds(
  account: Plan["account"],
): Promise<void> {
  const accountCredentialIds = account.access_points
    .map((accessPoint) => accessPoint.credential_id[0])
    .filter((credentialId): credentialId is string => !!credentialId)

  if (!accountCredentialIds.length) return

  const storedCredentialIds = await walletStorage.get("credentialIds")
  const existingCredentialIds: string[] = storedCredentialIds
    ? JSON.parse(storedCredentialIds as string)
    : []
  const updated = existingCredentialIds.filter(
    (credentialId) => !accountCredentialIds.includes(credentialId),
  )
  await walletStorage.set("credentialIds", JSON.stringify(updated))
}
