import React from "react"
import { FaCheck } from "react-icons/fa"
import { Link } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Footer } from "frontend/flows/screens-app/landing-page/footer"
import { Accordion, Button, Chip } from "frontend/ui-kit/src"

import { ProfileConstants } from "./screens-app/profile/routes"

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

  const questions = [
    {
      title: "What is NFID?",
      info: "NFID is the most private, secure, and convenient way to sign in to third-party apps and websites using the devices you already own. When you see a Continue with NFID prompt on a participating app or website, it means you can set up an account using your NFID. No more usernames or passwords to manage, no more loss of privacy, and no more identity theft or theft of the cryptocurrency you’re holding.",
    },
    {
      title: "How is this different than a cryptocurrency wallet?",
      info: "NFID creates a new cryptocurrency wallet for every account you create with NFID that can't be traced to each other, and only NFID offers the ability to create accounts and authenticate quickly and securely across all of your devices using the face or touch scan from those same devices. No more browser plugins or standalone apps to download and manage.",
    },
    {
      title: "What if my device is lost or stolen?",
      info: (
        <ul>
          <li>
            <strong className="pr-1">A</strong> - use one of your registered
            devices to remove the lost or stolen device from your list of NFID{" "}
            <Link
              className="text-blue-base"
              to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
            >
              authorized devices
            </Link>
            .
          </li>
          <li>
            <strong className="pr-1">B</strong> - remotely lock the lost or
            stolen device to prevent anyone from using it. Follow{" "}
            <Link to="#" className="text-blue-base">
              these
            </Link>{" "}
            instructions for Apple, these for Google, these for Microsoft.
          </li>
          <li>
            <strong className="pr-1">C</strong> - if you have no other
            registered devices, use your recovery phrase to temporarily
            authenticate yourself and remove the lost device from your list of
            NFID{" "}
            <Link
              className="text-blue-base"
              to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
            >
              authorized devices
            </Link>
            .
          </li>
        </ul>
      ),
    },
    {
      title:
        "Why don’t you offer passwords or other methods of authentication?",
      info: "Other authentication methods are the culprit for over 80% of all security hacks and data breaches because a username and password is all an attacker needs to impersonate you. NFID makes it impossible for anyone to breach any of your accounts without your device and the ability to unlock it.",
    },
    {
      title:
        "What if I don’t have a device with a face or touch scanner, or a security key?",
      info: (
        <>
          Please email us at{" "}
          <a href="mailto:hello@identitylabs.ooo" className="text-blue-base">
            hello@identitylabs.ooo
          </a>{" "}
          or let us know in the feedback channel of our Discord server - we want
          to make sure everyone has a self-sovereign identity that’s impossible
          to breach. If you don’t yet have a biometric-capable device, we want
          to hear from you.",
        </>
      ),
    },
  ]

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
            <div className="swiper-title tracking-wide">
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
          <div className="font-bold text-2xl col-span-12 text-center">
            The easiest way to preserve your privacy and secure your identity
            online
          </div>
        </div>

        <div className={classes.gridRow}>
          <div className="col-span-12">
            <div className={classes.header}>Only with NFID</div>
          </div>

          <div className="col-span-12 lg:col-span-4 pr-6 py-6">
            <div className={classes.subHeader}>Private</div>
            <div>
              Every account you create across any service that supports NFID
              will automatically create a new, untraceable hardware wallet. You
              are the only person in the world able to trace accounts to your
              NFID, providing you with the best possible privacy online.
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 pr-6 py-6">
            <div className={classes.subHeader}>Secure</div>
            <div>
              Hardware wallets offer the greatest security guarantees because
              their private keys can't be exported, making it a one-way vault
              that only you have the ability to access. NFID makes each of your
              internet accounts exactly this kind of vault.
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 pr-6 py-6">
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

            <div className="w-full justify-center flex">
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
            <div className="flex justify-around gap-12 items-center flex-wrap">
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

            <div className="w-full justify-center flex">
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
