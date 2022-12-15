import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"

import { getBalance } from "."

describe("getBalance", () => {
  it("should return correct balance.", async function () {
    const response = await getBalance(
      principalToAddress(
        Principal.fromText(
          "qykh3-evj5u-oahns-httff-2bp7z-vaqp4-smkrh-gdkqc-kfsyr-zkw5p-5ae",
        ),
      ),
    )
    expect(response).toEqual(BigInt(10000))
  })
})
