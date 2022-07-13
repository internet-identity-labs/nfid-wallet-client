import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { Button, H5 } from "@internet-identity-labs/nfid-sdk-react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { Footer } from "frontend/apps/marketing/landing-page/footer"
import { ArrowLeft } from "frontend/ui/atoms/icons/arrow-left"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import { EventSummary } from "../proof-of-attendency/event-summary"
import image_dog from "./dog_image.svg"

interface ProofOfAttendencyAwardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ProofOfAttendencyAward: React.FC<
  ProofOfAttendencyAwardProps
> = () => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#FF9533", "rgba(181,123,255,0.5)"],
        bubbleClassNames: [
          "right-[-40vw] md:right-[13vw] md:top-[16vh] absolute",
          "bottom-[-40vh] md:right-[35vw] md:top-[30vh] absolute",
        ],
      }}
      navigationItems={<div />}
      className="overflow-hidden"
    >
      <main
        className={clsx(
          // MOBILE
          "container m-auto flex flex-col pb-10 px-3",
          // SMALL
          "md:flex-1",
        )}
      >
        <div className="z-20">
          <Link to={"/profile/authenticate"}>
            <Button icon>
              <ArrowLeft />
            </Button>
          </Link>
        </div>
        <div
          className={clsx(
            // MOBILE
            "container flex flex-col mx-auto z-10",
            // SMALL
            "md:flex-row-reverse",
            // MEDIUM
            "",
          )}
        >
          <div className="flex flex-grow -mt-20 md:w-1/2 md:ml-auto min-h-[350px]">
            <img
              src={image_dog}
              className="object-contain object-center mx-auto"
              alt="anonymous dog"
            />
          </div>
          <div
            className={clsx(
              // MOBILE
              "flex flex-col md:w-1/2",
              // SMALL
              "sm:pt-16",
            )}
          >
            <EventSummary />
          </div>
        </div>
        <div
          className={clsx(
            // MOBILE
            "w-full",
            // MEDIUM
            "md:w-1/2 md:ml-auto mt-5",
          )}
        >
          <H5>IIWXXXIV Spring 2022</H5>
          <div className="mt-4">
            Internet Identity Labs presents NFID at IIW XXXIV, an Identity
            provider with a lot of buzz words: decentralized (inclusive of
            frontend), privacy-preserving one-touch MFA DID factory and crypto
            wallet. Webauthn as a primary means of authentication means
            non-exportable private keys are securely stored in the TPMs of your
            devices, and chain key cryptography on the Internet Computer means
            the same identifier is generated when authenticating to the same
            account regardless of which of your devices was used. <br />
            <br /> A new identifier is generated for every new account on every
            website, and is itself a new blockchain address that resolves into a
            DID that only the NFID owner can link together. Verifiable
            credentials issued to any of these DIDs, like this proof of
            attendance badge, can be presented while authenticated as a
            different DID on another website without revealing the DID it was
            issued to.
            <br />
            <br /> We believe a secure, privacy-preserving identity provider
            solving the key management problem this way abstracts away the
            complexity and provides an experience that non-technical people will
            be able to use.
          </div>
        </div>
        <Footer />
      </main>
    </AppScreen>
  )
}
