import clsx from "clsx"
import React, { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { Button, NFIDLogo } from "@nfid-frontend/ui"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

import AnimationDark1 from "./assets/animations/1_dark.json"
import AnimationDark2 from "./assets/animations/2_dark.json"
import AnimationDark3 from "./assets/animations/3_dark.json"
import AnimationDark4 from "./assets/animations/4_dark.json"
import Card1 from "./assets/cards/decentralized_icon_1.png"
import Card1Hover from "./assets/cards/decentralized_icon_1_hover.png"
import Card3 from "./assets/cards/globe_1.png"
import Card3Hover from "./assets/cards/globe_1_hover.png"
import Card2 from "./assets/cards/lock_1.png"
import Card2Hover from "./assets/cards/lock_1_hover.png"
import Card4 from "./assets/cards/person-1.png"
import Card4Hover from "./assets/cards/person-1_hover.png"
import Discord from "./assets/new-landing/Discord.png"
import Github from "./assets/new-landing/Github.png"
import Twitter from "./assets/new-landing/Twitter.png"
import Blockchain from "./assets/new-landing/sponsors/blockchain.png"
import Dfinity from "./assets/new-landing/sponsors/dfinity.png"
import Flyrfy from "./assets/new-landing/sponsors/flyrfly.png"
import Outliers from "./assets/new-landing/sponsors/outliers.png"
import Polychain from "./assets/new-landing/sponsors/polychain.png"
import Rarible from "./assets/new-landing/sponsors/rarible.png"
import Rubylight from "./assets/new-landing/sponsors/rubylight.png"
import Spaceship from "./assets/new-landing/sponsors/spaceship.png"
import Tomahawk from "./assets/new-landing/sponsors/tomahawk.png"
import Yards from "./assets/new-landing/sponsors/yards.png"
import MainBanner from "./assets/photo.png"
import PoweredBy from "./assets/poweredBy.svg"

import { NFIDAuthentication } from "./auth-modal"
import "./index.css"
import AnimationWrapper from "./visible-animation"

const container = "max-w-[1280px] mx-auto px-[30px] lg:px-0"
const asset = "relative w-full md:w-[40%] shrink-0 mx-auto sm:mx-0"
const section2 = "justify-between block md:flex gap-[60px] items-center"
const card =
  "px-5 bg-gradient-to-r from-purple-50 to-blue-50 md:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px] group"
const cardItem =
  "mt-[50px] md:mt-[90px] font-bold text-xl md:text-[28px] tracking-[0.2px} md:tracking-[0.28px] leading-[36px]"
const cardImg = "w-[100px] lg:w-[140px]"
const sponsor = "max-w-[150px] md:max-w-[220px] max-h-[80px]"

export const HomeScreen = () => {
  const [isAuthModalVisible, setIsAuthModalVisible] = React.useState(false)
  const { isAuthenticated } = useAuthentication()
  const navigate = useNavigate()

  const onContinue = useCallback(() => {
    return isAuthenticated
      ? navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
      : setIsAuthModalVisible(true)
  }, [isAuthenticated, navigate])

  return (
    <div>
      <NFIDAuthentication
        isVisible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />
      <div
        className={clsx("flex items-center justify-between py-2.5", container)}
      >
        <NFIDLogo />
        <div className="flex items-center text-sm font-semibold">
          <a
            href="https://learn.nfid.one/"
            target="_blank"
            className="mr-[50px]"
            rel="noreferrer"
          >
            Knowledge base
          </a>
          <p className="cursor-pointer" onClick={onContinue}>
            {isAuthenticated ? "Profile" : "Sign in"}
          </p>
        </div>
      </div>
      <section
        className={clsx("h-[75vh] relative overflow-visible", container)}
      >
        <div className="relative z-10 pt-[15vh] sm:max-w-[540px] text-center md:text-left">
          <div className="text-[32px] md:text-[54px] tracking-[-2.16px] font-bold">
            <p>Your digital identity</p>
            <p className="leading-[48px] gradient-text">for the modern world</p>
          </div>
          <p className="text-xl mt-[26px]">
            Embrace the new era of personal empowerment with NFID, the most
            advanced digital identity to keep your personal information private
            and digital assets secure.
          </p>
          <Button
            onClick={onContinue}
            className="mt-[30px] w-[148px] mx-auto md:mx-0"
          >
            Continue to NFID
          </Button>
        </div>
        <div className="absolute top-0 right-0 z-0 hidden md:block h-[70vh]">
          <img className="h-[175%] object-cover" src={MainBanner} alt="main" />
        </div>
      </section>
      <section
        className={clsx(
          "rounded-[30px] bg-[#0B0D32] py-[30px] lg:px-[60px] text-white relative z-10",
          "mt-[20vh] md:mt-0",
        )}
      >
        <div className={clsx("space-y-20 md:space-y-[100px]", container)}>
          <div className={clsx("flex-row-reverse", section2)}>
            <div className={clsx(asset)}>
              <AnimationWrapper animationData={AnimationDark1} />
            </div>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[633px]">
              <p className="font-light text-indigo-400 opacity-25">1/4</p>
              <p className="font-bold">Sign in everywhere</p>
              <p className="text-sm md:text-lg">
                NFID makes it easy for you to sign in and sign up to websites
                and apps across the internet without downloading additional
                software or navigating complicated setups. Sign in to your
                accounts in just one or two clicks from any device.
              </p>
            </div>
          </div>
          <div className={clsx(section2)}>
            <div className={clsx(asset)}>
              <AnimationWrapper animationData={AnimationDark2} />
            </div>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[633px]">
              <p className="font-light text-indigo-400 opacity-25">2/4</p>
              <p className="font-bold">Maintain your anonymity</p>
              <p className="text-sm md:text-lg">
                Your privacy is at the center of NFID’s design philosophy. Sign
                in to websites and apps with your username, profile photo, and
                digital asset information when you want to make purchases and
                share your public activity, or hide it when you want to stay
                private.
              </p>
            </div>
          </div>
          <div className={clsx("flex-row-reverse", section2)}>
            <div className={clsx(asset)}>
              <AnimationWrapper animationData={AnimationDark3} />
            </div>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[633px]">
              <p className="font-light text-indigo-400 opacity-25">3/4</p>
              <p className="font-bold">Protect your identity</p>
              <p className="text-sm md:text-lg">
                Powered by state-of-the-art passkey & chainkey technology, your
                NFID offers unprecedented security, insulating you from the
                vulnerabilities that threaten even the most fortified digital
                platforms. Your NFID is exclusively yours, accessible and usable
                by no one else.
              </p>
            </div>
          </div>
          <div className={clsx(section2)}>
            <div className={clsx(asset)}>
              <AnimationWrapper animationData={AnimationDark4} />
            </div>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[633px]">
              <p className="font-light text-indigo-400 opacity-25">4/4</p>
              <p className="font-bold">Sign in everywhere</p>
              <p className="text-sm md:text-lg">
                Powered by state-of-the-art passkey & chainkey technology, your
                NFID offers unprecedented security, insulating you from the
                vulnerabilities that threaten even the most fortified digital
                platforms. Your NFID is exclusively yours, accessible and usable
                by no one else.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className={clsx(container, "mt-[70px] md:mt-[165px]")}>
        <div className="text-center">
          <p className="leading-10 md:text-[42px] text-[32px] font-bold tracking-[0.32px] md:tracking-[0.42px]">
            Security isn’t a feature. It’s the foundation.
          </p>
          <p className="text-base md:text-[28px] font-bold md:font-light tracking-[0.16px] md:tracking-[0.28px] leading-[32px] max-w-[800px] mx-auto mt-[18px]">
            Breakthroughs in cryptography make owning a self-sovereign digital
            identity easier than ever before.
          </p>
        </div>
        <div className="mt-[27px] md:mt-[98px] grid grid-cols-1 md:grid-cols-2 md:gap-[30px] gap-[20px]">
          <div className={clsx(card)}>
            <img
              src={Card1}
              alt=""
              className={clsx(cardImg, "lg:group-hover:hidden")}
            />
            <img
              src={Card1Hover}
              alt=""
              className={clsx(cardImg, "hidden lg:group-hover:block")}
            />
            <p className={clsx(cardItem)}>
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
          <div className={clsx(card)}>
            <img
              src={Card2}
              alt=""
              className={clsx(cardImg, "lg:group-hover:hidden")}
            />
            <img
              src={Card2Hover}
              alt=""
              className={clsx(cardImg, "hidden lg:group-hover:block")}
            />
            <p className={clsx(cardItem)}>
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
          <div className={clsx(card)}>
            <img
              src={Card3}
              alt=""
              className={clsx(cardImg, "lg:group-hover:hidden")}
            />
            <img
              src={Card3Hover}
              alt=""
              className={clsx(cardImg, "hidden lg:group-hover:block")}
            />
            <p className={clsx(cardItem)}>
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
          <div className={clsx(card)}>
            <img
              src={Card4}
              alt=""
              className={clsx(cardImg, "lg:group-hover:hidden")}
            />
            <img
              src={Card4Hover}
              alt=""
              className={clsx(cardImg, "hidden lg:group-hover:block")}
            />
            <p className={clsx(cardItem)}>
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
        </div>
      </section>
      <section className={clsx(container, "mt-[70px] md:mt-[165px]")}>
        <p className="font-bold tracking-[0.32px] md:tracking-[0.42px] text-[32px] md:text-[42px]  text-center ">
          NFID is backed by industry leaders
        </p>
        <div className="grid grid-cols-2 sm:flex items-center justify-between mt-[78px] flex-wrap gap-10 md:gap-5">
          <img className={clsx(sponsor)} src={Tomahawk} alt="" />
          <img className={clsx(sponsor)} src={Polychain} alt="" />
          <img className={clsx(sponsor)} src={Outliers} alt="" />
          <img className={clsx(sponsor)} src={Spaceship} alt="" />
        </div>
        <div className="grid grid-cols-2 sm:flex items-center justify-between mt-10 md:mt-[78px] flex-wrap gap-10 md:gap-5">
          <img className={clsx(sponsor)} src={Dfinity} alt="" />
          <img className={clsx(sponsor)} src={Blockchain} alt="" />
          <img className={clsx(sponsor)} src={Flyrfy} alt="" />
          <img className={clsx(sponsor)} src={Rubylight} alt="" />
        </div>
        <p className="font-bold md:text-xl tracking-[0.16px] md:tracking-[0.2px] mt-[100px] md:mt-[115px] text-center">
          With angel investments from leaders at Rarible, 9Yards Capital, and
          others
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 mt-10 md:gap-5">
          <img className={clsx(sponsor)} src={Rarible} alt="" />
          <img className={clsx(sponsor)} src={Yards} alt="" />
        </div>
      </section>
      <section>
        <div className="flex items-center gap-x-[15px] md:gap-x-5 justify-center mt-[120px]">
          <a
            href="https://twitter.com/@IdentityMaxis"
            target="_blank"
            rel="noreferrer"
          >
            <img className="w-[100px] h-10" src={Twitter} alt="" />
          </a>
          <a
            href="https://discord.gg/a9BFNrYJ99"
            target="_blank"
            rel="noreferrer"
          >
            <img className="w-[100px] h-10" src={Discord} alt="" />
          </a>
          <a
            href="https://github.com/dostro/nfid-docs"
            target="_blank"
            rel="noreferrer"
          >
            <img className="w-[100px] h-10" src={Github} alt="" />
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 mt-[26px] md:mt-8 pb-[25px] md:pb-[30px] border-b border-gray-200">
          <p>© 2022 Internet Identity Labs, Inc</p>
          <a
            href="https://docs.nfid.one/legal/terms"
            target="_blank"
            rel="noreferrer"
          >
            Terms of service
          </a>
          <a
            href="https://docs.nfid.one/legal/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy policy
          </a>
        </div>
      </section>
      <div className="mt-[22px] md:mt-6 pb-6 flex justify-center">
        <a href="https://smartcontracts.org" target="_blank" rel="noreferrer">
          <img src={PoweredBy} alt="PoweredBy" />
        </a>
      </div>
    </div>
  )
}
export default HomeScreen
