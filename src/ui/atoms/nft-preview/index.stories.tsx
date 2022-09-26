import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import NFTPreview from "."

export default {
  title: "Atoms/NFT Preview",
  component: NFTPreview,
  parameters: {
    layout: "center",
  },
} as ComponentMeta<typeof NFTPreview>

const Template: ComponentStory<typeof NFTPreview> = (args) => {
  return (
    <Router>
      <ToastContainer />
      <NFTPreview {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  collection: {
    id: "cwu5z-wyaaa-aaaaj-qaoaq-cai",
    priority: 10,
    name: "Saga Legends #1: The Magician",
    brief: "Collectible Major Arcana for Tarot and Art Fans",
    description:
      "Saga is bringing Tarot into the Metaverse. These collectible Major Arcana NFTs celebrate and support our first official deck.",
    blurb: "",
    keywords: "Tarot Art",
    web: "https://legends.saga.cards/",
    telegram: "",
    discord: "https://discord.gg/eYqhNGzwzs",
    twitter: "https://twitter.com/sagacards",
    medium: "https://posts.saga.cards/",
    dscvr: "",
    distrikt: "",
    banner:
      "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-10/jc33zlj/banner.jpg",
    avatar:
      "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-10/tp23zt4/avatar.jpg",
    collection:
      "https://s3.amazonaws.com/pf-user-files-01/u-166728/uploads/2022-03-10/q043zey/collection-magician.jpg",
    route: "saga-the-magician",
    commission: 0.045,
    legacy: "",
    unit: "NFT",
    nftv: false,
    mature: false,
    market: true,
    dev: false,
    external: true,
    filter: false,
    sale: false,
    earn: false,
    saletype: "v1",
    standard: "legacy",
    detailpage: "",
    nftlicense: "",
    kyc: false,
  },
  canisterId: "cwu5z-wyaaa-aaaaj-qaoaq-cai",
  index: 12,
  tokenId: "2dg3x-uakor-uwiaa-aaaaa-cmadq-eaqca-aaaag-a",
  name: "Saga Legends #1: The Magician #12",
  assetPreview:
    "https://images.entrepot.app/t/cwu5z-wyaaa-aaaaj-qaoaq-cai/2dg3x-uakor-uwiaa-aaaaa-cmadq-eaqca-aaaag-a",
  assetFullsize: {
    url: "https://images.entrepot.app/t/cwu5z-wyaaa-aaaaj-qaoaq-cai/2dg3x-uakor-uwiaa-aaaaa-cmadq-eaqca-aaaag-a",
    format: "img",
  },
}
