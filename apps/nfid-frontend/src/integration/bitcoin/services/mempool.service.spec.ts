import { mempoolService } from "./mempool.service"

describe("MempoolService", () => {
  jest.setTimeout(50000)

  it("should return a true value for transaction id", async () => {
    const transactionId =
      "801f9c5824fcb357533c1070c5ff95cdfd71395a8f8466b71fc0db49f28ea769"
    const result = await mempoolService.checkTransactionAppeared(transactionId)
    expect(typeof result).toBe("boolean")
    expect(result).toBe(true)
  })

  it("should return a false value for non existing transaction id", async () => {
    const transactionId =
      "801f9c5824fcb357533c1070c5ff95cdfd71395a8f8466b71fc0db49f28ea768"
    const result = await mempoolService.checkTransactionAppeared(transactionId)
    expect(typeof result).toBe("boolean")
    expect(result).toBe(false)
  })
})
