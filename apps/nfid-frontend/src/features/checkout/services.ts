export const getPurchaseInfo = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fromAddress: "0xC7GER32FSR12DSF123HG976F",
        toAddress: "0xE7E132FSR12DSF11d234RE",
        network: "Ethereum",
        networkFee: {
          currency: "ETH",
          amount: 0,
        },
        price: {
          currency: "ETH",
          amount: 0.65,
        },
        total: {
          currency: "ETH",
          amount: 0.65,
        },
      })
    }, 3000)
  })
}

export const postLoaderService = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {}, 1000)
  })
}
