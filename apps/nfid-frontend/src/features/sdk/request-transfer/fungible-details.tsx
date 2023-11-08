export const RequestTransferFTDetails = ({
  amount,
  amountUSD,
}: {
  amount: string
  amountUSD: string
}) => {
  return (
    <div className="flex flex-col mt-5 text-center">
      <p id="amountICP" className="text-[32px] font-medium">
        {amount}
      </p>
      <p className="text-sm text-gray-400">
        {amountUSD}
      </p>
    </div>
  )
}
