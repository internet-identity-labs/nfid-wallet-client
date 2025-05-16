class Assertions {
  private static errors: string[] = []

  private static async softAssert(
    assertion: () => Promise<void>,
    message?: string,
  ): Promise<void> {
    try {
      await assertion()
    } catch (e: any) {
      const originalMessage = e instanceof Error ? e.message : String(e)
      const fullMessage = message
        ? `❌ ${message}\n\n${originalMessage}`
        : originalMessage
      this.errors.push(fullMessage)
    }
  }

  static async softAssertAll(
    ...assertions: ((() => Promise<void>) | [() => Promise<void>, string?])[]
  ): Promise<void> {
    this.clear()

    for (const assertionItem of assertions) {
      if (Array.isArray(assertionItem)) {
        const [assertion, message] = assertionItem
        await this.softAssert(assertion, message)
      } else {
        await this.softAssert(assertionItem)
      }
    }

    if (this.errors.length > 0) {
      const errorMessage = this.errors
        .map((e, i) => `#${i + 1}:\n${e}`)
        .join("\n\n---\n\n")
      this.clear()
      throw new Error(`SoftAssertAll assertion failed\n\n${errorMessage}`)
    }
  }

  private static clear(): void {
    this.errors = []
  }
}

export const softAssertAll = Assertions.softAssertAll.bind(Assertions)
