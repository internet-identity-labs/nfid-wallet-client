/**
 * @jest-environment jsdom
 */
import { ii } from "@nfid/integration"

import { getMultiIdent, lookup } from "../internet-identity"
import { II_DEVICES_DATA } from "../internet-identity/__mocks"

import { identityFromDeviceList } from "."

describe("identityFromDeviceList", () => {
  it("has parity with legacy method", async () => {
    // @ts-ignore: actor method extra data
    ii.lookup = jest.fn(async () => II_DEVICES_DATA)
    const legacy = getMultiIdent(await lookup(10_000), false)
    const next = identityFromDeviceList(await lookup(10_000), false)
    expect(next).toEqual(legacy)
  })
})
