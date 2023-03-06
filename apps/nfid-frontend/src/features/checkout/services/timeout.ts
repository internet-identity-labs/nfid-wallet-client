type DelayArgs = {
  timeout: number
}

export const timeoutSrv = ({ timeout }: DelayArgs) => {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      resolve(true)
    }, timeout)
    window.onbeforeunload = () => {
      clearTimeout(id)
      reject(new Error("window closed"))
    }
  })
}
