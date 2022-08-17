import React from "react"

import ProfileTransactionsPage from "frontend/ui/pages/new-profile/transaction-history"

const ProfileTransactions = () => {
  return (
    <ProfileTransactionsPage
      sentData={Array(21)
        .fill({
          datetime: "Jul 22, 2022 - 09:15:08 am",
          asset: "RCP",
          quantity: 100,
          from: "10hdi02jqd0912edjc98h9281ejd09fj09j09ejc09jx019j0jd",
          to: "44hdi02jqd0912edjc98h928234d09fj09j09ejc09jx019j24",
          note: "Hello world",
        })
        .map((a, index) => ({ ...a, quantity: 200 + index }))}
      receivedData={[]}
    />
  )
}

export default ProfileTransactions
