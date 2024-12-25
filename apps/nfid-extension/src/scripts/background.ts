import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background:", message)

  if (message.action === "startOAuth") {
    // Simulate the OAuth flow or other background actions
    console.log("Starting OAuth process...")

    // Send a response back to the sender
    const oauthUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=token&scope=YOUR_SCOPES"

    const isChrome = true

    if (isChrome) {
      // For Chrome - Use chrome.identity API
      const manifest = chrome.runtime.getManifest()
      if (!manifest.oauth2?.scopes)
        throw new Error("No OAuth2 scopes defined in the manifest file")

      const url = new URL("https://accounts.google.com/o/oauth2/auth")

      url.searchParams.set("client_id", manifest.oauth2.client_id)
      url.searchParams.set("response_type", "id_token")
      url.searchParams.set("access_type", "offline")
      url.searchParams.set(
        "redirect_uri",
        `https://${chrome.runtime.id}.chromiumapp.org`,
      )
      url.searchParams.set("prompt", "select_account")
      url.searchParams.set("scope", manifest.oauth2.scopes.join(" "))

      chrome.identity.launchWebAuthFlow(
        {
          url: url.href,
          interactive: true,
        },
        async (redirectedTo) => {
          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
              message: "OAuth started",
            })
          } else {
            const urlObj = new URL(redirectedTo!)
            const fragment = urlObj.hash.substring(1)
            const params = new URLSearchParams(fragment)
            const idToken = params.get("id_token")
            sendResponse({
              success: true,
              data: idToken,
              message: "OAuth started",
            })
          }
        },
      )
    }
    // else if (typeof browser !== "undefined" && browser.identity) {
    //   // For Firefox - Open a new tab manually
    //   browser.tabs.create({ url: oauthUrl }).then((tab) => {
    //     const tabId = tab.id

    //     // Listen for the OAuth redirect in Firefox
    //     const interval = setInterval(() => {
    //       browser.tabs.get(tabId).then((tab) => {
    //         if (tab.url && tab.url.startsWith("YOUR_REDIRECT_URI")) {
    //           // Token extracted from the URL
    //           const urlParams = new URLSearchParams(
    //             new URL(tab.url).hash.slice(1),
    //           )
    //           const accessToken = urlParams.get("access_token")
    //           console.log("Access Token:", accessToken)

    //           // Clean up and close the tab
    //           browser.tabs.remove(tabId)
    //           clearInterval(interval)
    //         }
    //       })
    //     }, 1000)
    //   })
    // }

    // Keep the message channel open for async response
    return true
  }

  if (message.action === "passkeyAuth") {
    passkeyConnector
      .loginWithPasskey(undefined, () => {}, message.allowedPasskeys ?? [])
      .then(response => {
        sendResponse(response)
      })
    return true
  }

  // Handle other actions here
})
