import { fail } from "assert"

import { readFile as readJSONFile } from "./fileops.js"

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

  public releaseUser(user: TestUser) {
    this.userMap.set(user, false)
    this.notify()
  }

  async setAuth(anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)
    let errors: string[] = []
    await browser.waitUntil(
      async () => {
        await browser.pause(1000)
        let executeResult = await browser.executeAsync(function (
          authState,
          done,
        ) {
          // @ts-ignore
          if (typeof setAuthState === "function") {
            try {
              // @ts-ignore
              setAuthState(authState)
                .then(async function (functionResult: Promise<string | Error>) {
                  done(String(await functionResult))
                })
                .catch(function (error: Error) {
                  done("error: " + error.message)
                })
            } catch (e) {
              let errorMessage
              if (e instanceof Error)
                errorMessage = `setAuthState error: ${e.message}`
              else errorMessage = `setAuthState got unknown error}`
              done(errorMessage)
            }
          } else done("setAuthState function is not available")
        }, testUser.authstate)
        errors.push(String(executeResult))
        let state = await this.getAuthStateFromDB()
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
        timeoutMsg: `Failed to set up authstate. Current state is: ${errors.join(", ")}`,
      },
    )
  }

  async getAuthStateFromDB(): Promise<{
    identity: string | null
    delegation: string | null
    errors: string[]
  }> {
    return await browser.executeAsync(function (done) {
      let errors: string[] = []
      const dbRequest = indexedDB.open("authstate")
      dbRequest.onerror = (event) => {
        const request = event.target as IDBRequest
        const errorMessage = request.error
          ? request.error.message
          : "Unknown error"
        errors.push(`Can't get "authstate" db. Error: ${errorMessage}`)
        done({ identity: null, delegation: null, errors })
      }
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result
        const transaction = db.transaction(["ic-keyval"], "readonly")
        const objectStore = transaction.objectStore("ic-keyval")

        const promises = ["identity", "delegation"].map(
          (key) =>
            new Promise((resolve, reject) => {
              const request = objectStore.get(key)
              request.onsuccess = () => {
                resolve(request.result !== undefined ? request.result : null)
              }
              request.onerror = () => {
                const errorMsg = `Can't get ${key} value. Error: ${request.error ? request.error.message : "Unknown error"}`
                errors.push(errorMsg)
                reject(errorMsg)
              }
            }),
        )
        Promise.all(promises)
          .then(([identity, delegation]) => {
            done({
              identity: identity as string | null,
              delegation: delegation as string | null,
              errors,
            })
          })
          .catch((error) => {
            errors.push(error)
            done({ identity: null, delegation: null, errors })
          })
      }
    })
  }

  async checkDatabaseExists(dbName: string): Promise<{
    result: boolean
    errors: string[]
  }> {
    return browser.executeAsync((dbName, done) => {
      let errors: string[] = []
      const request = indexedDB.open(dbName)

      request.onupgradeneeded = function () {
        errors.push(`Upgrade is needed for DB: ${dbName}, possibly not exists.`)
      }

      request.onsuccess = function () {
        request.result.close()
        done({ result: true, errors: errors })
      }

      request.onerror = function () {
        errors.push(
          `Error opening DB: ${dbName}. Error: ${request.error ? request.error.message : "Unknown error"}`,
        )
        done({ result: false, errors: errors })
      }

      request.onblocked = function () {
        errors.push(
          `Opening DB: ${dbName} is blocked, likely open connections.`,
        )
      }
    }, dbName)
  }

  async waitForDBAndDeleteDB(
    waitForDB: string,
    deleteDB: string,
  ): Promise<{
    result: boolean
    errors: string[]
  }> {
    let errors: string[] = []
    await browser.pause(1000)
    await this.checkDatabaseExists(waitForDB).then(async (it) => {
      errors.push(...it.errors)
      if (!it.result) {
        await browser.executeAsync((deleteDB, done) => {
          const deleteRequest = indexedDB.deleteDatabase(deleteDB)
          deleteRequest.onsuccess = function () {
            done(true)
          }
          deleteRequest.onerror = function () {
            errors.push(`Can't delete ${deleteDB}`)
            done(false)
          }
        }, deleteDB)
        await browser.refresh()
      }
    })
    let recheckResults = await this.checkDatabaseExists(waitForDB)
    errors.push(...recheckResults.errors)
    return {
      result: recheckResults.result,
      errors: errors,
    }
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
      return console.info("Subject: Observer has been attached already.")
    }

    console.info("Subject: Attached an observer.")
    this.observers.push(observer)
  }

  public detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer)
    if (observerIndex === -1) {
      return console.info("Subject: Nonexistent observer.")
    }

    this.observers.splice(observerIndex, 1)
    console.info("Subject: Detached an observer.")
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(): void {
    console.info("Subject: Notifying observers...")
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
