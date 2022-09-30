/**
 * @jest-environment jsdom
 */

import { getCapRootTransactions } from "frontend/integration/cap/cap_util"
import { expect } from "@jest/globals"

describe("cap util", () => {
  it("process empty collection router", async function() {
    await expect(getCapRootTransactions("usprd-faaaa-aaaam-qauda-cai", 0)).rejects.toThrow(
      "Psychedelic error. No root bucket for usprd-faaaa-aaaam-qauda-cai",
    )
  })
})
