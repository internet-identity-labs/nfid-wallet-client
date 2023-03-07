import useSWR from "swr";
import { getBtcTransactionHistory } from "src/features/fungable-token/btc/get-btc";

export const useBtcTransactions = () => {
  const { data: txs, ...rest } = useSWR(
    "btcTransactions",
    getBtcTransactionHistory
  );

  return { txs, ...rest };
};
