export const setupConsoleLogging = () => {
  (async function() {
    const log: any[] = []
    const origLog = console.log

    const origError = console.error
    console.error = function() {
      log.push({ type: "error", args: Array.from(arguments) })
      origError.apply(console, arguments as any)
    };

    (window as any).getConsoleLogs = function() {
      return log
    }
  })()
}

export const getConsoleLogs = () => {
  return (window as any).getConsoleLogs()
}
