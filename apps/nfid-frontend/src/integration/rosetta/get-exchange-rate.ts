import { PriceService } from "packages/integration/src/lib/asset/asset-util"

import { XdrUsd } from "frontend/integration/rosetta/rosetta_interface"

export async function mapToXdrUsd(response: Response): Promise<XdrUsd> {
  return response.json().then((data) => data as XdrUsd)
}

export async function getExchangeRate(symbol: string): Promise<number> {
  const tokens = await new PriceService().getPrice([symbol])

  const icp = tokens[0]
  return Number(icp.price)
}
