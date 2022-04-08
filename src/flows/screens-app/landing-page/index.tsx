import { Accordion, Button, Chip } from "@identity-labs/nfid-sdk-react"
import React from "react"
import { FaCheck } from "react-icons/fa"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Footer } from "frontend/flows/screens-app/landing-page/footer"

import { questions } from "./questions"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  const classes = {
    gridRow: "grid grid-cols-12 col-span-12 my-32",
    header: "text-4xl text-center font-bold py-12",
    subHeader: "font-bold text-2xl pb-12",
  }

  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: false,
      }}
    >
      <div id="home" className="-mt-28"></div>
      <div>
        <div className={classes.gridRow}>
          <div className="col-span-12 lg:col-span-6">
            <div className="tracking-wide swiper-title">
              The Identity Layer for the Internet
            </div>
            <div>Equip your Web 2.0 devices for Web 3.0 with NFID</div>
          </div>
          <div className="col-span-12 lg:col-span-6" />
        </div>

        <div className={classes.gridRow}>
          <div className="col-span-12 lg:col-span-6">
            <div className={classes.subHeader}>
              Digital wallets are a revolution in online identity management
            </div>
            <div>
              In today's surveillance society where everything about us is
              collected and sold between government and industry, digital
              wallets have the potential of offering us a way out.
            </div>
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="col-span-12 lg:col-span-6"></div>
          <div className="col-span-12 lg:col-span-6">
            <div className={classes.subHeader}>
              It's what we self-custody our identity credentials and digital
              assets with
            </div>
            <div>
              Like physical wallets, digital wallets keep our digital items -
              cryptocurrencies, NFTs, vaccine cards, diplomas, identity
              credentials, etc - away from thieves.
            </div>
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="col-span-12 lg:col-span-6">
            <div className={classes.subHeader}>
              But today's wallets all suffer from the same problems
            </div>
            <div>
              Online or software-based wallets can still be hacked, hardware
              wallets are hard to use, and no matter the type, all our online
              activity can still be tracked and associated to us personally.
            </div>
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="col-span-12 text-2xl font-bold text-center">
            The easiest way to preserve your privacy and secure your identity
            online
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="col-span-12">
            <div className={classes.header}>Only with NFID</div>
          </div>

          <div className="col-span-12 py-6 pr-6 lg:col-span-4">
            <div className={classes.subHeader}>Private</div>
            <div>
              Every account you create across any service that supports NFID
              will automatically create a new, untraceable hardware wallet. You
              are the only person in the world able to trace accounts to your
              NFID, providing you with the best possible privacy online.
            </div>
          </div>
          <div className="col-span-12 py-6 pr-6 lg:col-span-4">
            <div className={classes.subHeader}>Secure</div>
            <div>
              Hardware wallets offer the greatest security guarantees because
              their private keys can't be exported, making it a one-way vault
              that only you have the ability to access. NFID makes each of your
              internet accounts exactly this kind of vault.
            </div>
          </div>

          <div className="col-span-12 py-6 pr-6 lg:col-span-4">
            <div className={classes.subHeader}>Convenient</div>
            <div>
              A hardware device for each online account used to be impractical.
              NFID stores private keys on the specially-designed cryptographic
              chips of your phones, tablets, and computers so that creating new
              accounts or authenticating is simply a face or touch scan away.
            </div>
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="-mt-12" id="our-mission"></div>

          <div className="col-span-12">
            <div className={classes.header}>Our mission</div>
            <div>
              At Internet Identity Labs, our mission is to provide every human
              with the freedom to move digital assets, freedom to speak our
              minds, and freedom from targeted manipulation, all with the
              security and simplicity of the native face or fingerprint scan of
              our personal devices. We see a future where we can’t be subject to
              targeted manipulation because our activity can’t be tracked across
              accounts, where we can speak our minds because creating an account
              reveals no personal information about ourselves, and where we can
              move our digital assets without revealing who we are or the
              accounts in which our assets were stored.
            </div>

            <div className="mt-6">
              What we believe is simple: The internet should be our internet,
              nobody else's.
            </div>

            <div className="flex justify-center w-full">
              <Button primary large className="my-12">
                Read More
              </Button>
            </div>
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="-mt-12" id="partners"></div>
          <div className="col-span-12">
            <div className={classes.header}>Where you can use NFID today</div>
            <div className="flex flex-wrap items-center justify-around gap-12">
              {Array.from({ length: 12 }, (_, i) => (
                <Chip
                  icon={<FaCheck />}
                  className="py-4 !rounded-md mx-4 shrink-0 whitespace-nowrap"
                  key={i}
                >
                  <span>Item {i}</span>
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="-mt-12" id="faq"></div>
          <div className="col-span-12">
            <div className={classes.header}>Frequently Asked Questions</div>

            <div className="max-w-6xl mx-auto">
              {questions.map((question, i) => (
                <Accordion
                  title={question.title}
                  details={question.info}
                  key={i}
                  className="xl:text-lg"
                />
              ))}
            </div>

            <div className="flex justify-center w-full">
              <Button primary large className="my-12">
                View More
              </Button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AppScreen>
  )
}
