import { consoleWarning } from "./constants/console"

export const initializeConsoleWarnings = () => {
  console.log("%cWARNING", "color: red; font-size: 20px")
  console.log(consoleWarning, "font-size: 16px")
}

export const redirectFromCanisters = () => {
  const icHost = "3y5ko-7qaaa-aaaal-aaaaq-cai"
  const stageHost = "appqm-xiaaa-aaaak-akwaa-cai"
  const devHost = "n2mln-sqaaa-aaaag-abjoa-cai"

  if (window.location.host.includes(icHost))
    return (window.location.href = "https://nfid.one")

  if (window.location.host.includes(devHost))
    return (window.location.href = "https://dev.nfid.one")

  if (window.location.host.includes(stageHost))
    return (window.location.href = "https://staging.nfid.one")
}
