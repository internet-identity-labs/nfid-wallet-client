import { consoleWarning } from "./constants/console"

export const initializeConsoleWarnings = () => {
  console.log("%cWARNING", "color: red; font-size: 20px")
  console.log(consoleWarning, "font-size: 16px")
}

export const redirectFromCanisters = () => {
  const productionHost = "3y5ko-7qaaa-aaaal-aaaaq-cai.ic0.app"
  const devHost = "n2mln-sqaaa-aaaag-abjoa-cai"

  if (window.location.host === productionHost)
    return (window.location.href = "https://nfid.one")

  if (window.location.host === devHost)
    return (window.location.href = "https://nfid.dev")
}
