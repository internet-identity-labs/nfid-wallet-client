import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { getBalance } from "."

describe("getBalance", () => {
  it("should return correct balance.", async () => {
    const principal = Principal.fromText(
      "qykh3-evj5u-oahns-httff-2bp7z-vaqp4-smkrh-gdkqc-kfsyr-zkw5p-5ae",
    )
    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal })

    const response = await getBalance(accountIdentifier.toHex())
    expect(response).toEqual(BigInt(10000))
  })
})
