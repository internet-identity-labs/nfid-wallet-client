export const toUSD = (value: number, exchangeRate: number) =>
  exchangeRate !== 0 ? `${(exchangeRate * value).toFixed(2)} USD` : ``
