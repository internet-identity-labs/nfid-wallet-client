export const TOKEN_BRIDGE_ABI = [
  "function wrapAndTransferETH(uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) payable returns (uint64)",
  "function transferTokens(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) returns (uint64)",
  "function completeTransfer(bytes memory encodedVm)",
  "function wrappedAsset(uint16 tokenChainId, bytes32 tokenAddress) external view returns (address)",
]
