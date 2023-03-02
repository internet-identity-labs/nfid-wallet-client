import useSWR from "swr";

import { getBtcBalance } from "src/features/fungable-token/btc/get-btc-balance";

export const useBtcBalance = () => {
  const { data: balances, ...rest } = useSWR(
    "btcBalance",
    getBtcBalance
  );

  return { balances, ...rest };
};
