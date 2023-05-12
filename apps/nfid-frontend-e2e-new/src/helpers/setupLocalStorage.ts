import { command } from "webdriver"

/**
 *
 * https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidlocal_storage
 *
 */
// export class LocalStorageHelper implements JsonwpCommands {
// }

export async function addLocalStorageCommands(
  browser: WebdriverIO.Browser,
): Promise<void> {
  browser.addCommand(
    "getLocalStorage",
    command("GET", "/session/:sessionId/local_storage", {
      command: "getLocalStorage",
      description: "Get all keys of the storage.",
      ref: "https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidlocal_storage",
      variables: [],
      parameters: [],
    }),
  )

  browser.addCommand(
    "setLocalStorage",
    command("POST", "/session/:sessionId/local_storage", {
      command: "setLocalStorage",
      description: "Set the storage item for the given key.",
      ref: "",
      variables: [],
      parameters: [
        {
          name: "key",
          type: "string",
          description: "Local Storage key to set",
          required: true,
        },
        {
          name: "value",
          type: "string",
          description: "Local Storage value to set",
          required: true,
        },
      ],
    }),
  )

  browser.addCommand(
    "clearLocalStorage",
    command("DELETE", "/session/:sessionId/local_storage", {
      command: "clearLocalStorage",
      description: "Clear the storage.",
      ref: "",
      variables: [],
      parameters: [],
    }),
  )

  browser.addCommand(
    "getLocalStorageItem",
    command("GET", "/session/:sessionId/local_storage/key/:key", {
      command: "getLocalStorageItem",
      description: "Get the storage item for the given key.",
      ref: "",
      variables: [
        {
          name: "key",
          type: "string",
          description: "Local Storage key to set",
          required: true,
        },
      ],
      parameters: [],
    }),
  )

  browser.addCommand(
    "deleteLocalStorageItem",
    command("DELETE", "/session/:sessionId/local_storage/key/:key", {
      command: "deleteLocalStorageItem",
      description: "Remove the storage item for the given key.",
      ref: "",
      variables: [
        {
          name: "key",
          type: "string",
          description: "Local Storage key to set",
          required: true,
        },
      ],
      parameters: [],
    }),
  )
}
