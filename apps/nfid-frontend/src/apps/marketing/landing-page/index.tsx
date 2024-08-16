import { DotLottiePlayer } from "@dotlottie/react-player"
import "@dotlottie/react-player/dist/index.css"
import clsx from "clsx"
import React, { useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { Button, NFIDLogo } from "@nfid-frontend/ui"
import { landingPageTracking } from "@nfid/integration"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { getIsMobileDeviceMatch } from "frontend/integration/device"

import Animation1 from "./assets/animations/1_4.json"
import Animation2 from "./assets/animations/2_4.json"
import Animation3 from "./assets/animations/3_4.json"
import Animation4 from "./assets/animations/4_4.json"
import mainAnimation from "./assets/animations/main.lottie"
import Card1Hover from "./assets/cards/icon-1-hover.png"
import Card1 from "./assets/cards/icon-1.png"
import Card2Hover from "./assets/cards/icon-2-hover.png"
import Card2 from "./assets/cards/icon-2.png"
import Card3Hover from "./assets/cards/icon-3-hover.png"
import Card3 from "./assets/cards/icon-3.png"
import Card4Hover from "./assets/cards/icon-4-hover.png"
import Card4 from "./assets/cards/icon-4.png"
import Gradient from "./assets/gradient.png"
import Discord from "./assets/new-landing/ds.svg"
import Github from "./assets/new-landing/gh.svg"
import LinkedIn from "./assets/new-landing/ln.svg"
import Yards from "./assets/new-landing/sponsors/9yards.png"
import Blockchain from "./assets/new-landing/sponsors/blockchain.png"
import Dfinity from "./assets/new-landing/sponsors/dfinity.png"
import Flyrfy from "./assets/new-landing/sponsors/fyrfly.png"
import Gmjp from "./assets/new-landing/sponsors/gmjp.png"
import Outliers from "./assets/new-landing/sponsors/outliers.png"
import Polychain from "./assets/new-landing/sponsors/polychain.png"
import Rarible from "./assets/new-landing/sponsors/rarible.png"
import Rubylight from "./assets/new-landing/sponsors/rubylight.png"
import Spaceship from "./assets/new-landing/sponsors/spaceship.png"
import Tomahawk from "./assets/new-landing/sponsors/tomahawk.png"
import Twitter from "./assets/new-landing/x.svg"

import { AuthButton } from "./auth-button"
import { NFIDAuthentication } from "./auth-modal"
import "./index.css"
import AnimationWrapper from "./visible-animation"

const container = "max-w-[1280px] w-[calc(100%-60px)] mx-auto"
const asset =
  "my-5 sm:my-0 relative w-full md:w-[40%] min-w-[330px] min-h-[330px] shrink-0 mx-auto sm:mx-0"
const section2 = "justify-between block md:flex gap-[60px] items-center"
const card =
  "px-5 bg-[#112525] overflow-hidden relative bg-opacity-40 md:px-[16px] lg:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px] group card"
const cardItem =
  "mt-[10px] md:mt-[45px] font-medium text-xl md:text-[30px] tracking-[0.2px} md:tracking-[0.28px] leading-6 md:leading-[140%] max-w-[350px] lg:max-w-full text-[#BBF7EC]"
const cardImg = "w-full lg:w-[200px] absolute ml-[40px]"
const sponsor = "max-w-[150px] md:max-w-[220px] max-h-[80px] mx-auto md:max-0"

export const HomeScreen = () => {
  const [isAuthModalVisible, setIsAuthModalVisible] = React.useState(false)
  const { isAuthenticated } = useAuthentication()
  const navigate = useNavigate()
  const location = useLocation()
  const currentYear: number = new Date().getFullYear()

  React.useEffect(() => {
    setTimeout(() => {
      landingPageTracking.pageLoaded()
    })

    document.body.classList.add("homescreen")

    return () => {
      document.body.classList.remove("homescreen")
    }
  }, [])

  React.useEffect(() => {
    if (new URLSearchParams(location.search).get("auth") === "true") {
      setIsAuthModalVisible(true)
    }
  }, [location.search])

  const onContinue = useCallback(() => {
    return isAuthenticated
      ? navigate(`${ProfileConstants.base}/${ProfileConstants.tokens}`)
      : setIsAuthModalVisible(true)
  }, [isAuthenticated, navigate])

  return (
    <div className="overflow-x-hidden">
      <NFIDAuthentication
        isVisible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />
      <div className="sticky top-0 z-20">
        <div
          className={clsx(
            "flex items-center justify-between py-2.5",
            container,
          )}
        >
          <NFIDLogo />
          <div className="flex items-center text-sm font-semibold">
            <a
              href="https://learn.nfid.one/"
              target="_blank"
              className="mr-[50px] hidden md:inline-block text-white hover:text-[#2DEECB] transition-all"
              rel="noreferrer"
            >
              Knowledge base
            </a>
            <AuthButton
              isAuthenticated={isAuthenticated}
              onAuthClick={onContinue}
            />
          </div>
        </div>
      </div>
      <section
        className={clsx(
          "md:h-[75vh] relative overflow-visible max-h-[800px]",
          container,
        )}
      >
        <div className="gradient-radial"></div>
        <div className="relative z-10 pt-[15vh] md:max-w-[420px] lg:max-w-[540px] text-center md:text-left">
          <div className="text-[32px] md:text-[36px] lg:text-[54px] tracking-[-2.16px] font-bold">
            <p className="md:leading-[64px] gradient-text">
              Your crypto wallet & gateway to ICP apps
            </p>
          </div>
          <p className="text-xl mt-[30px] text-gray-50 md:max-w-[420px] lg:max-w-full">
            Start exploring ICP applications in seconds. Trusted by hundreds of
            thousands of users worldwide.
          </p>
          <Button
            id="authentication-button"
            onClick={onContinue}
            className="mt-[30px] w-[148px] mx-auto md:mx-0"
            type="green"
          >
            Go to wallet
          </Button>
        </div>
        <div className="absolute bottom-0 right-0 z-0 hidden w-full h-full md:block">
          <DotLottiePlayer
            src={mainAnimation}
            autoplay
            loop
            renderer="canvas"
            rendererSettings={{
              preserveAspectRatio: "xMidYMid slice",
              className: "w-full h-full object-cover",
            }}
          />
        </div>
      </section>
      <section
        className={clsx(
          "rounded-[30px] py-20 lg:px-[60px] text-white relative z-10",
          "mt-[20vh] md:mt-0 md:w-[calc(100%-60px)] mx-auto pb-20 gradient-box bg-[#03201C]",
        )}
        style={{
          backgroundImage: getIsMobileDeviceMatch() ? "" : `url(${Gradient})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className={clsx(
            "space-y-20 md:space-y-[100px] z-20 relative",
            container,
          )}
        >
          <div className={clsx("flex-row-reverse", section2)}>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[520px] px-5 lg:px-0">
              <p className="font-light text-[#2DEECB]">1/4</p>
              <p className="font-bold text-[28px] lg:text-[32px] leading-[140%]">
                Instant onboarding with your email address
              </p>
              <p className="text-sm md:text-lg text-[#D8FFF8]">
                NFID Wallet makes it easy for you to sign in and sign up to ICP
                websites and apps without downloading additional software or
                navigating complicated setups.
              </p>
            </div>
            <div className={clsx(asset)}>
              <AnimationWrapper
                animationData={Animation1}
                className="min-w-[330px] min-h-[330px] object-cover"
              />
            </div>
          </div>
          <div className={clsx(section2)}>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[520px] px-5 lg:px-0">
              <p className="font-light text-[#2DEECB]">2/4</p>
              <p className="font-bold text-[28px] lg:text-[32px] leading-[140%]">
                Unified account across the ICP ecosystem
              </p>
              <p className="text-sm md:text-lg text-[#D8FFF8]">
                Your privacy is central to NFID Wallet's design philosophy.
                Share your wallet address with apps that serve you and your
                assets, or keep it hidden when you prefer to stay private.
              </p>
            </div>
            <div className={clsx(asset)}>
              <AnimationWrapper
                animationData={Animation2}
                className="min-w-[330px] min-h-[330px] object-cover"
              />
            </div>
          </div>
          <div className={clsx("flex-row-reverse", section2)}>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[520px] px-5 lg:px-0">
              <p className="font-light text-[#2DEECB]">3/4</p>
              <p className="font-bold text-[28px] lg:text-[32px] leading-[140%]">
                Greater security with Passkey authentication
              </p>
              <p className="text-sm md:text-lg text-[#D8FFF8]">
                Powered by cutting-edge Passkey and Chainkey technology, NFID
                Wallet shields you from vulnerabilities that compromise even the
                most secure digital platforms.
              </p>
            </div>
            <div className={clsx(asset)}>
              <AnimationWrapper
                animationData={Animation3}
                className="min-w-[330px] min-h-[330px] object-cover"
              />
            </div>
          </div>
          <div className={clsx(section2)}>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[520px] px-5">
              <p className="font-light text-[#2DEECB]">4/4</p>
              <p className="font-bold text-[28px] lg:text-[32px] leading-[140%]">
                ICP, ICRC, and EXT token support
              </p>
              <p className="text-sm md:text-lg text-[#D8FFF8]">
                NFID Wallet empowers you to seamlessly manage ICP, ICRC-1
                tokens, collectibles, and more, all under the protection of the
                most advanced smart contract platform available.
              </p>
            </div>
            <div className={clsx(asset)}>
              <AnimationWrapper
                animationData={Animation4}
                className="min-w-[330px] min-h-[330px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <section className={clsx(container, "mt-[70px] md:mt-[165px]")}>
        <div className="text-center">
          <p className="leading-[120%] md:text-[42px] text-[32px] font-bold tracking-[0.32px] md:tracking-[0.42px] gradient-text">
            Security isn’t a feature. It’s the foundation.
          </p>
          <p className="text-base md:text-[22px] font-bold md:font-light tracking-[0.16px] md:tracking-[0.28px] leading-6 md:leading-8 max-w-[820px] mx-auto mt-[18px] text-gray-50">
            Breakthroughs in cryptography make owning a self-sovereign digital
            identity easier than ever before.
          </p>
        </div>
        <div className="mt-[27px] md:mt-[98px] grid grid-cols-1 md:grid-cols-2 md:gap-[30px] gap-[20px]">
          <div className={clsx(card)}>
            <div className="gradient-radial-card"></div>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <img src={Card1} alt="" className={clsx(cardImg, "z-10")} />
              <img
                src={Card1Hover}
                alt=""
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <p className={clsx(cardItem)}>
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </p>
          </div>
          <div className={clsx(card)}>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <div className="gradient-radial-card"></div>
              <img src={Card2} alt="" className={clsx(cardImg, "z-10")} />
              <img
                src={Card2Hover}
                alt=""
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <p className={clsx(cardItem)}>
              Protected by best-in-class auth with enterprise security and
              multi-factor recovery methods.
            </p>
          </div>
          <div className={clsx(card)}>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <div className="gradient-radial-card"></div>
              <img src={Card3} alt="" className={clsx(cardImg, "z-10")} />
              <img
                src={Card3Hover}
                alt=""
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <p className={clsx(cardItem)}>
              Trusted by hundreds of thousands of people and businesses around
              the world.
            </p>
          </div>
          <div className={clsx(card)}>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <div className="gradient-radial-card"></div>
              <img src={Card4} alt="" className={clsx(cardImg, "z-10")} />
              <img
                src={Card4Hover}
                alt=""
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <p className={clsx(cardItem)}>
              Backed by some of the most trusted names in the crypto and Web3
              industry.
            </p>
          </div>
        </div>
      </section>
      <section className={clsx(container, "mt-[70px] md:mt-[165px]")}>
        <div className="grid grid-cols-2 sm:flex items-center justify-center md:justify-between mt-[78px] flex-wrap gap-10 md:gap-5">
          <img className={clsx(sponsor)} src={Tomahawk} alt="" />
          <img className={clsx(sponsor)} src={Polychain} alt="" />
          <img className={clsx(sponsor)} src={Outliers} alt="" />
          <img className={clsx(sponsor)} src={Dfinity} alt="" />
          <img className={clsx(sponsor)} src={Gmjp} alt="" />
          <img className={clsx(sponsor)} src={Rarible} alt="" />
        </div>
        <div className="grid grid-cols-2 sm:flex items-center justify-center md:justify-around mt-10 md:mt-[78px] flex-wrap gap-10 md:gap-5">
          <img className={clsx(sponsor)} src={Yards} alt="" />
          <img className={clsx(sponsor)} src={Blockchain} alt="" />
          <img className={clsx(sponsor)} src={Flyrfy} alt="" />
          <img className={clsx(sponsor)} src={Rubylight} alt="" />
          <img className={clsx(sponsor)} src={Spaceship} alt="" />
        </div>
      </section>
      <section className={clsx(container)}>
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-x-5 gap-y-4 mt-[80px] md:mt-[160px] pb-[25px] md:pb-[30px] text-white">
          <div className="order-2 md:order-1 text-center md:text-left">
            <a
              href="https://docs.nfid.one/legal/terms"
              target="_blank"
              rel="noreferrer"
              className="mr-[30px] leading-[30px] inline-block hover:text-[#2DEECB] transition-all"
            >
              Terms of service
            </a>
            <a
              href="https://docs.nfid.one/legal/privacy"
              target="_blank"
              rel="noreferrer"
              className="leading-[30px] inline-block hover:text-[#2DEECB] transition-all"
            >
              Privacy policy
            </a>
            <p className="leading-[30px] text-[#71717A] mt-[8px]">
              Copyright {currentYear}. Internet Identity Labs, Inc. All Rights
              Reserved.
            </p>
          </div>
          <div className="flex items-center gap-x-[20px] md:gap-x-5 justify-center order-1">
            <a
              href="https://twitter.com/@IdentityMaxis"
              target="_blank"
              rel="noreferrer"
              className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#8B9BA6] transition-all active:bg-[#8B9BA6] active:opacity-70"
            >
              <img className="w-[24px] h-[24px]" src={Twitter} alt="" />
            </a>
            <a
              href="https://github.com/dostro/nfid-docs"
              target="_blank"
              rel="noreferrer"
              className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#AA8353] transition-all active:bg-[#AA8353] active:opacity-70"
            >
              <img className="w-[24px] h-[24px]" src={Github} alt="" />
            </a>
            <a
              href="https://discord.gg/a9BFNrYJ99"
              target="_blank"
              rel="noreferrer"
              className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#5C6CFF] transition-all active:bg-[#5C6CFF] active:opacity-70"
            >
              <img className="w-[24px] h-[24px]" src={Discord} alt="" />
            </a>
            <a
              href="https://linkedin.com/company/nfid-labs"
              target="_blank"
              rel="noreferrer"
              className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#37A5F0] transition-all active:bg-[#37A5F0] active:opacity-70"
            >
              <img className="w-[24px] h-[24px]" src={LinkedIn} alt="" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
export default HomeScreen
