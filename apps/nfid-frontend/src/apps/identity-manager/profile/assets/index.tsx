import React, { useEffect } from "react";

import { useAllToken } from "frontend/features/fungable-token/use-all-token";
import { AssetFilter } from "frontend/ui/connnector/types";
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets";
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate";

import { ProfileConstants } from "../routes";
import {
  getICRC1Data,
  getICRC1DataForUser,
} from "packages/integration/src/lib/icrc1";
import { authState, im } from "@nfid/integration";
import { Chain, getPublicKey } from "packages/integration/src/lib/lambda/ecdsa";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { useAuthentication } from "frontend/apps/authentication/use-authentication";

import useSWR from "swr";

const ProfileAssets = () => {
  const [assetFilter, setAssetFilter] = React.useState<AssetFilter[]>([]);
  const { navigate } = useNFIDNavigate();
  const { token, isLoading } = useAllToken(assetFilter);

  console.debug("ProfileAssets", { token });

  const { data: account } = useSWR("im.get_account", async () => {
    return await im.get_account();
  });

  const {
    data: ICRC1Token,
    isLoading: isLoadingICRC1Token,
    isValidating,
  } = useSWR(account ? [account, "getICRC1Data"] : null, async ([account]) => {
    console.debug("getICRC1Data", account);
    const key = await getPublicKey(
      authState.get().delegationIdentity!,
      Chain.IC
    );
    const principal = Ed25519KeyIdentity.fromParsedJson([
      key,
      "0",
    ]).getPrincipal();
    const root = account.data[0]?.principal_id!;
    console.debug("getICRC1Data", { root, principal });

    return await getICRC1DataForUser(root, principal.toText());
  });

  console.debug('ICRC1Token!!', ICRC1Token)


  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      isLoading={isLoading}
      tokens={token}
      ICRCTokens={ICRC1Token}
      assetFilter={assetFilter}
      setAssetFilter={setAssetFilter}
    />
  );
};

export default ProfileAssets;
