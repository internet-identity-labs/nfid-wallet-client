export const setupConsoleLogging = () => {
  (function() {
    if (document.readyState !== "complete") {
      return
    }
    const log: any[] = []
    const origError = console.error

    console.error = function(...args: any[]) {
      log.push({ type: "error", args: Array.from(args) })
      origError.apply(console, args)
    };

    (window as any).getConsoleLogs = function() {
      return log
    }
  })()
}

export const getConsoleLogs = () => {
  return (window as any).getConsoleLogs ? (window as any).getConsoleLogs() : []
}
