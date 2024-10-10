class SoftAssertions {
  private static errors: string[] = []

  private static async softAssert(
    assertion: () => Promise<void>,
  ): Promise<void> {
    try {
      await assertion()
    } catch (e: any) {
      this.errors.push(e.message)
    }
  }

  public static async softAssertAll(
    ...assertions: (() => Promise<void>)[]
  ): Promise<void> {
    this.clear()

    for (const assertion of assertions) {
      await this.softAssert(assertion)
    }

    if (this.errors.length > 0) {
      const errorMessage = `${this.errors.join("\n")}`
      this.clear()
      throw new Error(errorMessage)
    }
  }

  private static clear(): void {
    this.errors = []
  }
}

export const softAssertAll = SoftAssertions.softAssertAll.bind(SoftAssertions)
