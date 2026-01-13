export function checkIsIframe() {
  try {
    return window.self !== window.top
  } catch (_e) {
    return true
  }
}
