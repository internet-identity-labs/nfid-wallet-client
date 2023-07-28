import clsx from "clsx"
import Lottie from "lottie-react"
import React from "react"

import { Button, NFIDLogo } from "@nfid-frontend/ui"

import AnimationDark1 from "./assets/animations/1_dark.json"
import AnimationDark2 from "./assets/animations/2_dark.json"
import AnimationDark3 from "./assets/animations/3_dark.json"
import AnimationDark4 from "./assets/animations/4_dark.json"
import Discord from "./assets/new-landing/Discord.png"
import Github from "./assets/new-landing/Github.png"
import Twitter from "./assets/new-landing/Twitter.png"
import Lock from "./assets/new-landing/lock.svg"
import Blockchain from "./assets/new-landing/sponsors/blockchain.svg"
import Dfinity from "./assets/new-landing/sponsors/dfinity.svg"
import Flyrfy from "./assets/new-landing/sponsors/flyrfly.svg"
import Outliers from "./assets/new-landing/sponsors/outliers.svg"
import Polychain from "./assets/new-landing/sponsors/polychain.svg"
import Rarible from "./assets/new-landing/sponsors/rarible.svg"
import Rubylight from "./assets/new-landing/sponsors/rubylight.svg"
import Spaceship from "./assets/new-landing/sponsors/spaceship.svg"
import Tomahawk from "./assets/new-landing/sponsors/tomahawk.svg"
import Yards from "./assets/new-landing/sponsors/yards.svg"
import MainBanner from "./assets/photo.png"
import PoweredBy from "./assets/poweredBy.svg"

import "./index.css"
import "./index.css"

const container = "max-w-[1280px] mx-auto"
const asset = "relative w-[40%] shrink-0 mx-auto sm:mx-0"
const section2 = "justify-between block md:flex gap-[60px] items-center"

const darkInteractivity: any = (frames: number) => ({
  mode: "scroll",
  actions: [
    {
      type: "play",
      visibility: [0, 0.7],
      frames: [0, frames],
    },
  ],
})

export const HomeScreen = () => {
  return (
    <div>
      <div
        className={clsx("flex items-center justify-between py-2.5", container)}
      >
        <NFIDLogo />
        <div className="flex items-center text-sm font-semibold">
          <a href="#!" className="mr-[50px]">
            Knowledge base
          </a>
          <a href="#!">Sign in</a>
        </div>
      </div>
      <section
        className={clsx("h-[75vh] relative overflow-visible", container)}
      >
        <div className="relative z-10 pt-[15vh] sm:max-w-[540px]">
          <div className="text-[54px] tracking-[-2.16px] font-bold">
            <p>Your digital identity</p>
            <p className="leading-[48px] gradient-text">for the modern world</p>
          </div>
          <p className="text-xl mt-[26px]">
            Embrace the new era of personal empowerment with NFID, the most
            advanced digital identity to keep your personal information private
            and digital assets secure.
          </p>
          <Button className="mt-[30px] w-[148px]">Continue to NFID</Button>
        </div>
        <div className="absolute top-0 right-0 z-0 hidden md:block h-[70vh]">
          <img className="h-[175%]" src={MainBanner} alt="main" />
        </div>
      </section>
      <section
        className={clsx(
          "rounded-[30px] bg-[#0B0D32] py-[30px] px-[60px] text-white relative z-10",
        )}
      >
        <div className={clsx("space-y-20 md:space-y-[100px]", container)}>
          <div className={clsx("flex-row-reverse", section2)}>
            <div className={clsx(asset)}>
              <Lottie
                animationData={AnimationDark1}
                interactivity={darkInteractivity(116)}
                loop={false}
              />
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
              <Lottie
                animationData={AnimationDark2}
                interactivity={darkInteractivity(119)}
                loop={false}
              />
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
              <Lottie
                animationData={AnimationDark3}
                interactivity={darkInteractivity(135)}
                loop={false}
              />
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
              <Lottie
                animationData={AnimationDark4}
                interactivity={darkInteractivity(180)}
                loop={false}
              />
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
      <section className="mt-[70px] md:mt-[165px]">
        <div className="text-center">
          <p className="md:text-[42px] text-[32px] font-bold tracking-[0.32px] md:tracking-[0.42px]">
            Security isn’t a feature. It’s the foundation.
          </p>
          <p className="text-base md:text-[28px] font-bold  md:font-light tracking-[0.16px] md:tracking-[0.28px] max-w-[800px] mx-auto mt-[18px]">
            Breakthroughs in cryptography make owning a self-sovereign digital
            identity easier than ever before.
          </p>
        </div>
        <div className="mt-[27px] md:mt-[98px] grid grid-cols-1 md:grid-cols-2 md:gap-[30px] gap-[20px] ">
          <div className="px-5 bg-gradient-to-r from-purple-50 to-blue-50 md:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px]">
            <img src={Lock} alt="" className="md:w-[140px] w-[100px]" />
            <p className="mt-[50px] md:mt-[90px] font-bold text-xl md:text-[28px] tracking-[0.2px} md:tracking-[0.28px]">
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
          <div className="px-5 bg-gradient-to-r from-purple-50 to-blue-50 md:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px]">
            <img src={Lock} alt="" />
            <p className="mt-[50px] md:mt-[90px] font-bold text-xl md:text-[28px] tracking-[0.2px} md:tracking-[0.28px]">
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
          <div className="px-5 bg-gradient-to-r from-purple-50 to-blue-50 md:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px]">
            <img src={Lock} alt="" />
            <p className="mt-[50px] md:mt-[90px] font-bold text-xl md:text-[28px] tracking-[0.2px} md:tracking-[0.28px]">
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
          <div className="px-5 bg-gradient-to-r from-purple-50 to-blue-50 md:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px]">
            <img src={Lock} alt="" />
            <p className="mt-[50px] md:mt-[90px] font-bold text-xl md:text-[28px] tracking-[0.2px} md:tracking-[0.28px]">
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
        </div>
      </section>
      <section className="mt-[70px] md:mt-[165px]">
        <p className="font-bold tracking-[0.32px] md:tracking-[0.42px] text-[32px] md:text-[42px]  text-center ">
          NFID is backed by industry leaders
        </p>
        <div className="flex items-center justify-between mt-[78px] flex-wrap gap-10 md:gap-5">
          <img src={Tomahawk} alt="" />
          <img src={Polychain} alt="" />
          <img src={Outliers} alt="" />
          <img src={Spaceship} alt="" />
        </div>
        <div className="flex items-center justify-between mt-10 md:mt-[78px] flex-wrap gap-10 md:gap-5">
          <img src={Dfinity} alt="" />
          <img src={Blockchain} alt="" />
          <img src={Flyrfy} alt="" />
          <img src={Rubylight} alt="" />
        </div>
        <p className="font-bold md:text-xl tracking-[0.16px] md:tracking-[0.2px] mt-[100px] md:mt-[115px] text-center">
          With angel investments from leaders at Rarible, 9Yards Capital, and
          others
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 mt-10 md:gap-5">
          <img src={Rarible} alt="" />
          <img src={Yards} alt="" />
        </div>
      </section>
      <section>
        <div className="flex items-center gap-x-[15px] md:gap-x-5 justify-center mt-[120px]">
          <img src={Twitter} alt="" />
          <img src={Discord} alt="" />
          <img src={Github} alt="" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 mt-[26px] md:mt-8 pb-[25px] md:pb-[30px] border-b border-gray-200">
          <p>© 2022 Internet Identity Labs, Inc</p>
          <a href="#!">Terms of service</a>
          <a href="#!">Privacy policy</a>
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
