export const createTokenPublicAbi = {
  inputs: [
    {
      internalType: "string",
      name: "_name",
      type: "string",
    },
    {
      internalType: "string",
      name: "_symbol",
      type: "string",
    },
    {
      internalType: "string",
      name: "baseURI",
      type: "string",
    },
    {
      internalType: "string",
      name: "contractURI",
      type: "string",
    },
    {
      internalType: "address[]",
      name: "operators",
      type: "address[]",
    },
    {
      internalType: "uint256",
      name: "salt",
      type: "uint256",
    },
  ],
  name: "createToken",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function",
}
