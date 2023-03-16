export const mintAndTransferAbi = {
  inputs: [
    {
      components: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "tokenURI",
          type: "string",
        },
        {
          components: [
            {
              internalType: "address payable",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "value",
              type: "uint96",
            },
          ],
          internalType: "struct LibPart.Part[]",
          name: "creators",
          type: "tuple[]",
        },
        {
          components: [
            {
              internalType: "address payable",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint96",
              name: "value",
              type: "uint96",
            },
          ],
          internalType: "struct LibPart.Part[]",
          name: "royalties",
          type: "tuple[]",
        },
        {
          internalType: "bytes[]",
          name: "signatures",
          type: "bytes[]",
        },
      ],
      internalType: "struct LibERC721LazyMint.Mint721Data",
      name: "data",
      type: "tuple",
    },
    {
      internalType: "address",
      name: "to",
      type: "address",
    },
  ],
  name: "mintAndTransfer",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function",
}
