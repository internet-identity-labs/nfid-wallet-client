import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileTransactionsPage from "."

export default {
  title: "Screens/NewProfile/Transactions",
  component: ProfileTransactionsPage,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof ProfileTransactionsPage>

const Template: StoryFn<typeof ProfileTransactionsPage> = (args) => {
  return (
    <Router>
      <ProfileTransactionsPage {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,

  args: {
    sentData: [],
    // sentData: Array(11)
    //   .fill({
    //     datetime: "Jul 21, 2022 - 09:15:08 am",
    //     asset: "ICP",
    //     quantity: 100,
    //     from: "10hdi02jqd0912edjc98h9281ejd09fj09j09ejc09jx019j0jd",
    //     to: "44hdi02jqd0912edjc98h928234d09fj09j09ejc09jx019j24",
    //     note: "Hello world",
    //   })
    //   .map((a, index) => ({ ...a, quantity: 100 + index })),
    receivedData: Array(51)
      .fill({
        datetime: "Jul 22, 2022 - 09:15:08 am",
        asset: "RCP",
        quantity: 100,
        from: "10hdi02jqd0912edjc98h9281ejd09fj09j09ejc09jx019j0jd",
        to: "44hdi02jqd0912edjc98h928234d09fj09j09ejc09jx019j24",
        note: "Hello world",
      })
      .map((a, index) => ({ ...a, quantity: 200 + index })),
  },
}
