export const directAcceptBidAbi = {
  inputs: [
    {
      components: [
        {
          internalType: "address",
          name: "bidMaker",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "bidNftAmount",
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
          name: "bidPaymentAmount",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "paymentToken",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "bidSalt",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "bidStart",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "bidEnd",
          type: "uint256",
        },
        {
          internalType: "bytes4",
          name: "bidDataType",
          type: "bytes4",
        },
        {
          internalType: "bytes",
          name: "bidData",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "bidSignature",
          type: "bytes",
        },
        {
          internalType: "uint256",
          name: "sellOrderPaymentAmount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "sellOrderNftAmount",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "sellOrderData",
          type: "bytes",
        },
      ],
      internalType: "struct LibDirectTransfer.AcceptBid",
      name: "direct",
      type: "tuple",
    },
  ],
  name: "directAcceptBid",
  outputs: [],
  stateMutability: "payable",
  type: "function",
}
