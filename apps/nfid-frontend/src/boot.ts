import { consoleWarning } from "./constants/console"

export const initializeConsoleWarnings = () => {
  console.log("%cWARNING", "color: red; font-size: 20px")
  console.log(consoleWarning, "font-size: 16px")
}

export const redirectFromCanisters = () => {
  const productionHost = "3y5ko-7qaaa-aaaal-aaaaq-cai.ic0.app"
  const devHost = "dq6kg-laaaa-aaaah-aaeaq-cai.ic0.app"

  if (window.location.host === productionHost)
    return (window.location.href = "https://nfid.one")

  if (window.location.host === devHost)
    return (window.location.href = "https://nfid.dev")
}
