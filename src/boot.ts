import { consoleWarning } from "./constants/console"

export const initializeConsoleWarnings = () => {
  console.log("%cWARNING", "color: red; font-size: 20px")
  console.log(consoleWarning, "font-size: 16px")
}
