import { fetchProfile } from "frontend/integration/identity-manager"

const HOT_FIX_V24_1_WRONG_HOSTNAMES = [
  "https://playground-dev.nfid.one",
  "https://dscvr.one",
  "https://hotornot.wtf",
  "https://awcae-maaaa-aaaam-abmyq-cai.icp0.io", // BOOM DAO
  "https://7p3gx-jaaaa-aaaal-acbda-cai.raw.ic0.app", // BOOM DAO
  "https://scifi.scinet.one",
  "https://oc.app",
  "https://signalsicp.com",
  "https://n7z64-2yaaa-aaaam-abnsa-cai.icp0.io", // BOOM DAO
  "https://nuance.xyz",
  "https://h3cjw-syaaa-aaaam-qbbia-cai.ic0.app", // The Asset App
  "https://trax.so",
  "https://jmorc-qiaaa-aaaam-aaeda-cai.ic0.app", // Unfold VR
  "https://65t4u-siaaa-aaaal-qbx4q-cai.ic0.app", // my-icp-app
]

const HOT_FIX_V24_2_WRONG_ANCHORS = 100009230

export async function isDerivationBug(origin: string) {
  const profile = await fetchProfile()
  const anchor = profile.anchor

  const isBuggedHostname = HOT_FIX_V24_1_WRONG_HOSTNAMES.includes(origin)

  return isBuggedHostname && anchor < HOT_FIX_V24_2_WRONG_ANCHORS
}
