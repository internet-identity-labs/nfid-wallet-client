export const setupConsoleLogging = () => {
  (function() {
    const log: any[] = []
    const origLog = console.log

    console.log = function() {
      log.push({ type: "log", args: Array.from(arguments) })
      origLog.apply(console, arguments as any)
    }
    const origError = console.error
    console.error = function() {
      log.push({ type: "error", args: Array.from(arguments) })
      origError.apply(console, arguments as any)
    }
    const origWarn = console.warn
    console.warn = function() {
      log.push({ type: "warn", args: Array.from(arguments) })
      origWarn.apply(console, arguments as any)
    };

    (window as any).getConsoleLogs = function() {
      return log
    }
  })()
}

export const getConsoleLogs = () => {
  return (window as any).getConsoleLogs()
}
