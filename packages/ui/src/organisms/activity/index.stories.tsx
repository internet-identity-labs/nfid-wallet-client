import { Meta, StoryFn } from "@storybook/react"

import { IActivityRowGroup } from "frontend/features/activity/types"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"
import { FT } from "frontend/integration/ft/ft"
import { Blockchain } from "@nfid/integration/token/types"

import ProfileContainer from "../../atoms/profile-container/Container"
import { Activity, ActivityProps } from "./index"

const mockActivityRows: IActivityRowGroup[] = [
  {
    date: "September 1, 2024",
    rows: [
      {
        id: "1",
        action: "Sent" as IActivityAction,
        chain: "IC" as Chain,
        network: "Internet Computer" as Blockchain,
        timestamp: new Date("2024-09-01T12:00:00Z"),
        asset: {
          type: "ft",
          currency: "ICP",
          amount: 1000000,
          rate: 7.23,
          decimals: 8,
        },
        from: "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
        to: "i4ebx-nrtqy-776qp-w7yyr-2yvhj-ll4uj-kxmqj-ms7oq-ie3kn-gzxsq-xqe",
      },
      {
        id: "2",
        action: "Sent" as IActivityAction,
        chain: "IC" as Chain,
        network: "Internet Computer" as Blockchain,
        timestamp: new Date("2024-09-01T13:00:00Z"),
        asset: {
          type: "ft",
          currency: "DKP",
          amount: 10000000000,
          rate: 0.017,
          decimals: 8,
        },
        from: "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
        to: "i4ebx-nrtqy-776qp-w7yyr-2yvhj-ll4uj-kxmqj-ms7oq-ie3kn-gzxsq-xqe",
      },
    ],
  },
  {
    date: "September 2, 2024",
    rows: [
      {
        id: "1",
        action: "Sent" as IActivityAction,
        chain: "IC" as Chain,
        network: "Internet Computer" as Blockchain,
        timestamp: new Date("2024-09-01T12:00:00Z"),
        asset: {
          type: "ft",
          currency: "ICP",
          amount: 20000000,
          rate: 7.23,
          decimals: 8,
        },
        from: "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
        to: "i4ebx-nrtqy-776qp-w7yyr-2yvhj-ll4uj-kxmqj-ms7oq-ie3kn-gzxsq-xqe",
      },
    ],
  },
]

const mockActivityData = {
  activities: mockActivityRows,
  filter: [],
  setFilter: () => {},
  isValidating: false,
  hasMoreData: true,
  loadMore: async () => {},
  isButtonLoading: false,
  resetHandler: () => {},
}

const mockTokens = [
  {
    getTokenName: () => "Token 1",
    getTokenAddress: () => "0x123",
    getTokenLogo: () => "https://example.com/logo1.png",
    getTokenSymbol: () => "TOK1",
  },
  {
    getTokenName: () => "Token 2",
    getTokenAddress: () => "0x456",
    getTokenLogo: () => "https://example.com/logo2.png",
    getTokenSymbol: () => "TOK2",
  },
]

const meta: Meta = {
  title: "Organisms/Activity",
  component: Activity,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<ActivityProps> = (args) => {
  return (
    <div className="p-[30px] overflow-hidden w-full">
      <ProfileContainer innerClassName="!px-0">
        <Activity {...args} />
      </ProfileContainer>
    </div>
  )
}

Default.args = {
  activityData: mockActivityData,
  tokens: mockTokens as FT[],
  isTokensLoading: false,
}
