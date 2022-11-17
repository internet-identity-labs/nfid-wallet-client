import { cyclesMinter } from "@nfid/integration"

import { XdrUsd } from "frontend/integration/rosetta/rosetta_interface"

import { converter } from "./index"
import { restCall } from "./util"

export async function mapToXdrUsd(response: Response): Promise<XdrUsd> {
  return response.json().then((data) => data as XdrUsd)
}

export async function getExchangeRate(): Promise<number> {
  let xdrToIcp = await cyclesMinter
    .get_icp_xdr_conversion_rate()
    .then((x) => x.data.xdr_permyriad_per_icp)
    .catch((e) => {
      throw Error(`CyclesMinter failed!: ${e}`, e)
    })
  let xdrToUsd: XdrUsd = await restCall("GET", converter)
    .then(mapToXdrUsd)
    .catch((e) => {
      throw Error(`free.currconv.com failed!: ${e}`, e)
    })
  return (parseFloat(xdrToUsd.XDR_USD) * Number(xdrToIcp)) / 10000
}
