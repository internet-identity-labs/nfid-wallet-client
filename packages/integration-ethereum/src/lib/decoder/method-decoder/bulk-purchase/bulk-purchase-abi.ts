export const bulkPurchaseAbi = {
  inputs: [
    {
      components: [
        {
          internalType: "enum RaribleExchangeWrapper.Markets",
          name: "marketId",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "fees",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      internalType: "struct RaribleExchangeWrapper.PurchaseDetails[]",
      name: "purchaseDetails",
      type: "tuple[]",
    },
    {
      internalType: "address",
      name: "feeRecipientFirst",
      type: "address",
    },
    {
      internalType: "address",
      name: "feeRecipientSecond",
      type: "address",
    },
    {
      internalType: "bool",
      name: "allowFail",
      type: "bool",
    },
  ],
  name: "bulkPurchase",
  outputs: [],
  stateMutability: "payable",
  type: "function",
}
