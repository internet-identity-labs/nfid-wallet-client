import NFIDWallet from "../../assets/nfid-wallet.svg"

export const SDKFooter = () => {
  return (
    <div className="flex items-center justify-between w-full mt-6">
      <div className="flex text-xs font-medium text-gray-400 space-x-2.5">
        <a
          href="https://docs.nfid.one/legal/terms"
          target="_blank"
          className="hover:opacity-80"
          rel="noreferrer"
        >
          Terms of service
        </a>
        <a
          href="https://docs.nfid.one/legal/privacy"
          target="_blank"
          className="hover:opacity-80"
          rel="noreferrer"
        >
          Privacy policy
        </a>
      </div>
      <img src={NFIDWallet} alt="NFIDWallet" />
    </div>
  )
}
