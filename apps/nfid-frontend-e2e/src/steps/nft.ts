import { Then } from "@cucumber/cucumber"

import { softAssertAll } from "../helpers/assertions.js"
import Nft from "../pages/nft.js"

Then(
  /^Verifying that the token with name (.+) and collection (.+?)(?: and ID (.+))? is displayed$/,
  async (token: string, collection: string, id?: string) => {
    await (await Nft.getNftName(token, collection)).waitForDisplayed({
      timeout: 20000,
      timeoutMsg: `Not found NFT with name ${token} and collection ${collection}`,
    })
    await (await Nft.getNftCollection(collection)).waitForDisplayed({
      timeout: 20000,
      timeoutMsg: `Not found collection with name ${collection}`,
    })

    if (id)
      await (await Nft.getNftId(id)).waitForDisplayed({
        timeout: 20000,
        timeoutMsg: `Token ID ${id} is wrong or still not displayed in 5sec`,
      })
  },
)

Then(
  /^Verifying that details are: standard - ([^"]*), collection - ([^"]*), about - ([^"]*)/,
  async (standard: string, collection: string, about: string) => {
    await softAssertAll(
      async () =>
        expect(await Nft.getNftStandard.getText()).toContain(standard),
      async () =>
        expect(await Nft.getCollectionId.getText()).toContain(collection),
      async () => expect(await Nft.getAbout.getText()).toContain(about),
    )
  },
)

Then(
  /^Verifying that (\d+) NFT (?:is|are) displayed on collectibles page$/,
  async (amount: number) => {
    await Nft.getNftCollectiblesAmount(amount)
  },
)

Then(/^User switches to table view$/, async () => {
  await Nft.switchToTable()
})

Then(
  /^User goes to details of the nft with name ([^"]*) and collection ([^"]*)$/,
  async (token: string, collection: string) => {
    await Nft.nftDetails(token, collection)
  },
)

Then(
  /^Verifying that the first raw has the next values: type ([^"]*), date ([^"]*), from ([^"]*), to ([^"]*), price ([^"]*) in activity section$/,
  async (
    type: string,
    date: string,
    from: string,
    to: string,
    price: string,
  ) => {
    await softAssertAll(
      async () =>
        expect(await Nft.getValueFromColumnAtFirstRow("Event type")).toContain(
          type,
        ),
      async () =>
        expect(
          await Nft.getValueFromColumnAtFirstRow("Date and time"),
        ).toContain(date),
      async () =>
        expect(await Nft.getValueFromColumnAtFirstRow("To")).toContain(to),
      async () =>
        expect(await Nft.getValueFromColumnAtFirstRow("Price")).toContain(
          price,
        ),
      // TODO BUG - "From" field is empty () => expect(await Nft.getValueFromColumnAtFirstRow("From")).toContain(price)
    )
  },
)
