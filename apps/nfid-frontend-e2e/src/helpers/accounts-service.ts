import { fail } from "assert"

import { readFile as readJSONFile } from "./fileops.js"

type WindowWithAuthState = Window & {
  setAuthState?: (authState: TestUser["authstate"]) => Promise<string | Error>
}

/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
interface UserActions {
  // Attach an observer to the subject.
  attach(observer: Observer): void

  // Detach an observer from the subject.
  detach(observer: Observer): void

  // Notify all observers about an event.
  notify(): void
}

/**
 * The Subject owns some important state and notifies observers when the state
 * changes.
 */
class UserService implements UserActions {
  /**
   * @type {number} For the sake of simplicity, the Subject's state, essential
   * to all subscribers, is stored in this variable.
   */
  public userMap: Map<TestUser, boolean> = new Map()
  public users: TestUser[] = []

  constructor() {
    this.users = readJSONFile("./users.json")
    this.users.map((user) => this.userMap.set(user, false))
  }

  public async takeUser(user: TestUser) {
    this.userMap.set(user, true)
    this.notify()
  }

  //please note that this method should be used only for static users
  public async takeStaticUserByAnchor(anchor: number) {
    const user = this.users.find((user) => user.account.anchor == anchor)
    if (user) {
      await this.takeUser(user)
      return user
    }
    fail("All users borrowed")
  }

  async setAuth(anchor: number) {
    const testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)
    const errors: string[] = []
    await browser.waitUntil(
      async () => {
        await browser.pause(1000)
        const executeResult = await browser.execute(async function (authState) {
          const authWindow = window as WindowWithAuthState

          if (typeof authWindow.setAuthState === "function") {
            try {
              return String(await authWindow.setAuthState(authState))
            } catch (e) {
              let errorMessage
              if (e instanceof Error)
                errorMessage = `setAuthState error: ${e.message}`
              else errorMessage = `setAuthState got unknown error}`
              return errorMessage
            }
          }

          return "setAuthState function is not available"
        }, testUser.authstate)
        errors.push(String(executeResult))
        const state = await this.getAuthStateFromDB()
        errors.push(...state.errors)
        return (
          state.identity?.toString() ==
            testUser.authstate.identity.toString() &&
          JSON.stringify(state.delegation) ==
            JSON.stringify(testUser.authstate.delegation)
        )
      },
      {
        timeout: 60000,
        timeoutMsg: `Failed to set up authstate. Current state is: ${errors.join(
          ", ",
        )}`,
      },
    )
  }

  async getAuthStateFromDB(): Promise<{
    identity: string | null
    delegation: string | null
    errors: string[]
  }> {
    return await browser.execute(async function () {
      const errors: string[] = []
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const dbRequest = indexedDB.open("authstate")

        dbRequest.onerror = (event) => {
          const request = event.target as IDBRequest
          const errorMessage = request.error
            ? request.error.message
            : "Unknown error"
          reject(`Can't get "authstate" db. Error: ${errorMessage}`)
        }

        dbRequest.onsuccess = (event) => {
          resolve((event.target as IDBRequest<IDBDatabase>).result)
        }
      }).catch((error) => {
        errors.push(String(error))
        return null
      })

      if (!db) {
        return { identity: null, delegation: null, errors }
      }

      const transaction = db.transaction(["ic-keyval"], "readonly")
      const objectStore = transaction.objectStore("ic-keyval")

      const promises = ["identity", "delegation"].map(
        (key) =>
          new Promise<string | null>((resolve, reject) => {
            const request = objectStore.get(key)
            request.onsuccess = () => {
              resolve(request.result !== undefined ? request.result : null)
            }
            request.onerror = () => {
              const errorMsg = `Can't get ${key} value. Error: ${
                request.error ? request.error.message : "Unknown error"
              }`
              errors.push(errorMsg)
              reject(errorMsg)
            }
          }),
      )

      try {
        const [identity, delegation] = await Promise.all(promises)

        return {
          identity,
          delegation,
          errors,
        }
      } catch (error) {
        errors.push(String(error))
        return { identity: null, delegation: null, errors }
      }
    })
  }

  /**
   * @type {Observer[]} List of subscribers. In real life, the list of
   * subscribers can be stored more comprehensively (categorized by event
   * type, etc.).
   */
  private observers: Observer[] = []

  /**
   * The subscription management methods.
   */
  public attach(observer: Observer): void {
    const isExist = this.observers.includes(observer)
    if (isExist) {
      return console.warn("Subject: Observer has been attached already.")
    }

    console.warn("Subject: Attached an observer.")
    this.observers.push(observer)
  }

  public detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer)
    if (observerIndex === -1) {
      return console.warn("Subject: Nonexistent observer.")
    }

    this.observers.splice(observerIndex, 1)
    console.warn("Subject: Detached an observer.")
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(): void {
    console.warn("Subject: Notifying observers...")
    for (const observer of this.observers) {
      observer.update(this)
    }
  }
}

/**
 * The Observer interface declares the update method, used by subjects.
 */
interface Observer {
  // Receive update from subject.
  update(subject: UserActions): void
}

const userClient = new UserService()
export default userClient
