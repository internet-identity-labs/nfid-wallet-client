import bowser from "bowser"

// TODO: refactor to bowser plugin
export const getBrowser = () => {
  const agent = window.navigator.userAgent.toLowerCase()
  switch (true) {
    case agent.indexOf("edge") > -1:
      return "Edge"
    case agent.indexOf("opr") > -1 && !!(window as any).opr:
      return "Opera"
    case agent.indexOf("chrome") > -1 && !!(window as any).chrome:
      return "Chrome"
    case agent.indexOf("trident") > -1:
      return "IE"
    case agent.indexOf("firefox") > -1:
      return "Firefox"
    case agent.indexOf("safari") > -1:
      return "Safari"
    default:
      return "Other"
  }
}

export const getBrowserVersion = () => {
  const browser = bowser.getParser(window.navigator.userAgent)

  return browser.getBrowser().version
}

export const getBrowserName = () => {
  const browser = bowser.getParser(window.navigator.userAgent)

  return browser.getBrowser().name
}

export const isOdd = (num: number) => num % 2 === 1

export const getUrl = (url: string) => {
  if (!/^(http|https):\/\//.test(url)) {
    url = `${window.location.protocol}//${url}`
  }

  return new URL(url)
}

/**
 * Turn Hello World! into hello-world
 *
 * @export
 * @param {string} str
 */
export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
