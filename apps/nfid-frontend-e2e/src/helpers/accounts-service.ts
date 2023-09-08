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
