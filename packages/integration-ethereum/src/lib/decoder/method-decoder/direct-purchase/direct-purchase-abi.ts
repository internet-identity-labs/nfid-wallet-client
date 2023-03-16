export const directPurchaseAbi = {
  inputs: [
    {
      components: [
        {
          internalType: "address",
          name: "sellOrderMaker",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "sellOrderNftAmount",
          type: "uint256",
        },
        {
          internalType: "bytes4",
          name: "nftAssetClass",
          type: "bytes4",
        },
        {
          internalType: "bytes",
          name: "nftData",
          type: "bytes",
        },
        {
          internalType: "uint256",
          name: "sellOrderPaymentAmount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "paymentToken",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "sellOrderSalt",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "sellOrderStart",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "sellOrderEnd",
          type: "uint256",
        },
        {
          internalType: "bytes4",
          name: "sellOrderDataType",
          type: "bytes4",
        },
        {
          internalType: "bytes",
          name: "sellOrderData",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "sellOrderSignature",
          type: "bytes",
        },
        {
          internalType: "uint256",
          name: "buyOrderPaymentAmount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "buyOrderNftAmount",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "buyOrderData",
          type: "bytes",
        },
      ],
      internalType: "struct LibDirectTransfer.Purchase",
      name: "direct",
      type: "tuple",
    },
  ],
  name: "directPurchase",
  outputs: [],
  stateMutability: "payable",
  type: "function",
}
