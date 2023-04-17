import { fetchProfile } from "src/integration/identity-manager";
import { getWalletDelegation } from "src/integration/facade/wallet";
import { ethereumAsset } from "@nfid/integration";
import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types";


export const getErc20Tokens = async (): Promise<Array<TokenBalanceSheet>> => {
  let profile = await fetchProfile();
  const identity = await getWalletDelegation(profile.anchor, "nfid.one", "0");
  return await ethereumAsset.getErc20Accounts(identity);
};

