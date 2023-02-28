export const getEthProvider = () => {
  return "production" === FRONTEND_MODE
    ? "https://ethereum.publicnode.com"
    : "https://ethereum-goerli-rpc.allthatnode.com"
}
