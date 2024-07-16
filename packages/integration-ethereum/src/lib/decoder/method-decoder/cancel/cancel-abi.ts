export const cancelAbi = {
  inputs: [
    {
      components: [
        {
          internalType: "address",
          name: "maker",
          type: "address",
        },
        {
          components: [
            {
              components: [
                {
                  internalType: "bytes4",
                  name: "assetClass",
                  type: "bytes4",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
              ],
              internalType: "struct LibAsset.AssetType",
              name: "assetType",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          internalType: "struct LibAsset.Asset",
          name: "makeAsset",
          type: "tuple",
        },
        {
          internalType: "address",
          name: "taker",
          type: "address",
        },
        {
          components: [
            {
              components: [
                {
                  internalType: "bytes4",
                  name: "assetClass",
                  type: "bytes4",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
              ],
              internalType: "struct LibAsset.AssetType",
              name: "assetType",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          internalType: "struct LibAsset.Asset",
          name: "takeAsset",
          type: "tuple",
        },
        {
          internalType: "uint256",
          name: "salt",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "start",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "end",
          type: "uint256",
        },
        {
          internalType: "bytes4",
          name: "dataType",
          type: "bytes4",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      internalType: "struct LibOrder.Order",
      name: "order",
      type: "tuple",
    },
  ],
  name: "cancel",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function",
}
