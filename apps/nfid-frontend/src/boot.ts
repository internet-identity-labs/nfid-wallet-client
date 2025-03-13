import { consoleWarning } from "./constants/console"

export const initializeConsoleWarnings = () => {
  console.log("%cWARNING", "color: red; font-size: 20px")
  console.log(consoleWarning, "font-size: 16px")
}

export const redirectFromCanisters = () => {
  const icCanisterId = "3y5ko-7qaaa-aaaal-aaaaq-cai"
  const stageCanisterId = "appqm-xiaaa-aaaak-akwaa-cai"
  const devCanisterId = "cfel3-byaaa-aaaaa-qafvq-cai"

  if (
    window.location.host !== `${icCanisterId}.icp0.io` &&
    window.location.host.includes(icCanisterId)
  )
    return (window.location.href = `https://${icCanisterId}.icp0.io`)

  if (
    window.location.host !== `${devCanisterId}.icp0.io` &&
    window.location.host.includes(devCanisterId)
  )
    return (window.location.href = `https://${devCanisterId}.icp0.io`)

  if (
    window.location.host !== `${stageCanisterId}.icp0.io` &&
    window.location.host.includes(stageCanisterId)
  )
    return (window.location.href = `https://${stageCanisterId}.icp0.io`)
}
