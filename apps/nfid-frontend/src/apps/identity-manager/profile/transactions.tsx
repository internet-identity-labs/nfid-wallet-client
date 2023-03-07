import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { IOption } from "@nfid-frontend/ui";
import { sortByDate } from "@nfid-frontend/utils";

import { useEthTransactions } from "frontend/features/fungable-token/eth/hooks/use-eth-transactions";
import { selectReceivedTransactions, selectSendTransactions } from "frontend/integration/rosetta/select-transactions";
import { useTransactionsFilter } from "frontend/integration/wallet/hooks/use-transactions-filter";
import { useWallet } from "frontend/integration/wallet/hooks/use-wallet";
import { Loader } from "frontend/ui/atoms/loader";
import ProfileTransactionsPage from "frontend/ui/pages/new-profile/transaction-history";
import { useBtcTransactions } from "src/features/fungable-token/btc/hooks/use-btc-transactions";

const ProfileTransactions = () => {
  const { walletTransactions, isWalletLoading } = useWallet();
  const { sendTransactions: sendEthTXs, receiveTransactions: receiveEthTXs } =
    useEthTransactions();
  const { txs: btcTxs } = useBtcTransactions();

  const sendBtcTransactions = useMemo(() => {
    return btcTxs?.sendTransactions?.filter((tx) => tx.type === "send") ?? [];
  }, [btcTxs]);
  const receivedBtcTransactions = useMemo(() => {
    return btcTxs?.receivedTransactions?.filter((tx) => tx.type === "received") ?? [];
  }, [btcTxs]);
  const btcWalletAddress = btcTxs?.walletAddress;
  const btcAddress = btcTxs?.btcAddress;

  const [search] = useSearchParams();

  let transactionFilterFromSearch = search.get("wallet");

  console.log("transactionFilterFromSearch", transactionFilterFromSearch);

  //dirty hack. don't do like this
  if (btcAddress === transactionFilterFromSearch && btcWalletAddress) {
    console.log("btcWalletAddress", btcWalletAddress);
    transactionFilterFromSearch = btcWalletAddress;
  }
  console.log("transactionFilterFromSearch2", transactionFilterFromSearch);

  let [transactionFilter, setTransactionFilter] = React.useState<string[]>(
    transactionFilterFromSearch ? [transactionFilterFromSearch] : []
  );

  const btcTransactionAmount = receivedBtcTransactions.length + sendBtcTransactions.length;

  const { transactionsFilterOptions } = useTransactionsFilter({
    excludeEmpty: false,
    btcData: {
      value: btcWalletAddress,
      transactions: btcTransactionAmount
    }
  });

  console.log("transactionFilter", transactionFilter);
  let selectedTransactionFilter = React.useMemo(
    () => {
      let tf = transactionFilter
        .map((f) => transactionsFilterOptions.find((tf) => tf.value === f))
        .filter((f: IOption | undefined): f is IOption => Boolean(f));
      // if (tf.length === 0) {
      //   tf = transactionFilter
      //     .map((f) => transactionsFilterOptions.find((tf) => tf.label === "NFID account 1"))
      //     .filter((f: IOption | undefined): f is IOption => Boolean(f));
      // }
      return tf;
    }
    ,
    [transactionFilter, transactionsFilterOptions, btcAddress]
  );


  // FIXME: find suitable hook to return the walletAddresses
  // they need to be calculated already when fetching transactions
  const walletAddresses = React.useMemo(
    () =>
      transactionFilter.length === 0
        ? transactionsFilterOptions.map((tfo) => tfo.value)
        : transactionFilter,
    [transactionFilter, transactionsFilterOptions, btcAddress, selectedTransactionFilter]
  );

  const sendTransactions = React.useMemo(
    () =>
      walletTransactions
        ? sortByDate(
          selectSendTransactions({
            transactions: walletTransactions,
            accounts: walletAddresses
          }).concat(sendEthTXs)
            .concat(sendBtcTransactions.filter(
              () => {
                return btcWalletAddress ?
                  walletAddresses.indexOf(btcWalletAddress) > -1
                  : false;
              }
            )),
          "MMM dd',' yyyy - hh:mm:ss a"
        )
        : [],
    [sendEthTXs, walletAddresses, walletTransactions, sendBtcTransactions, selectedTransactionFilter]
  );

  const recceivedTransactions = React.useMemo(
    () =>
      walletTransactions
        ? sortByDate(
          selectReceivedTransactions({
            transactions: walletTransactions,
            accounts: walletAddresses
          }).concat(receiveEthTXs)
            .concat(receivedBtcTransactions.filter(
              () => {
                return btcWalletAddress ?
                  walletAddresses.indexOf(btcWalletAddress) > -1
                  : false;
              }
            )),
          "MMM dd',' yyyy - hh:mm:ss a"
        )
        : [],
    [receiveEthTXs, walletAddresses, walletTransactions, receivedBtcTransactions, selectedTransactionFilter]
  );

  const handleRemoveFilterChip = React.useCallback(
    (value: string) => {
      const transactionFilter = selectedTransactionFilter.filter(
        (stf) => stf.label !== value
      );
      setTransactionFilter(transactionFilter.map((tf) => tf.value));
    },
    [selectedTransactionFilter]
  );

  return (
    <>
      <Loader isLoading={isWalletLoading} />
      <ProfileTransactionsPage
        sentData={sendTransactions}
        receivedData={recceivedTransactions}
        transactionsFilterOptions={transactionsFilterOptions}
        setTransactionFilter={setTransactionFilter}
        selectedTransactionFilter={transactionFilter}
        chips={selectedTransactionFilter.map((f) => f.label)}
        onChipRemove={handleRemoveFilterChip}
      />
    </>
  );
};

export default ProfileTransactions;
