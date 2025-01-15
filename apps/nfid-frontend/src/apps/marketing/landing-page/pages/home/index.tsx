import clsx from "clsx"
import Lottie from "lottie-react"
import React from "react"
import { useLocation } from "react-router-dom"

import { Button } from "@nfid-frontend/ui"

import Animation1 from "../../assets/animations/1_4.json"
import Animation2 from "../../assets/animations/2_4.json"
import Animation3 from "../../assets/animations/3_4.json"
import Animation4 from "../../assets/animations/4_4.json"
import mainAnmation from "../../assets/animations/main.json"
import Audit from "../../assets/audit.png"
import Card1Hover from "../../assets/cards/icon-1-hover.png"
import Card1 from "../../assets/cards/icon-1.png"
import Card2Hover from "../../assets/cards/icon-2-hover.png"
import Card2 from "../../assets/cards/icon-2.png"
import Card3Hover from "../../assets/cards/icon-3-hover.png"
import Card3 from "../../assets/cards/icon-3.png"
import Card4Hover from "../../assets/cards/icon-4-hover.png"
import Card4 from "../../assets/cards/icon-4.png"
import Yards from "../../assets/new-landing/sponsors/9yards.png"
import Blockchain from "../../assets/new-landing/sponsors/blockchain.png"
import Dfinity from "../../assets/new-landing/sponsors/dfinity.png"
import Flyrfy from "../../assets/new-landing/sponsors/fyrfly.png"
import Gmjp from "../../assets/new-landing/sponsors/gmjp.png"
import Outliers from "../../assets/new-landing/sponsors/outliers.png"
import Polychain from "../../assets/new-landing/sponsors/polychain.png"
import Rarible from "../../assets/new-landing/sponsors/rarible.png"
import Rubylight from "../../assets/new-landing/sponsors/rubylight.png"
import Spaceship from "../../assets/new-landing/sponsors/spaceship.png"
import Tomahawk from "../../assets/new-landing/sponsors/tomahawk.png"
import { Container } from "../../ui/container"
import { Footer } from "../../ui/footer"
import AnimationWrapper from "../../ui/visible-animation"
import { Wrapper } from "../wrapper"
import { LinkIcon } from "./link-icon"
import { SnsBanner } from "./sns-banner"
import { SnsModal } from "./sns-modal"

const asset =
  "my-5 sm:my-0 relative w-full md:w-[40%] min-w-[330px] min-h-[330px] shrink-0 mx-auto sm:mx-0"
const section2 =
  "flex-col lg:flex-row justify-between block md:flex gap-[60px] items-center"
const card =
  "px-5 bg-[#112525] overflow-hidden relative bg-opacity-40 md:px-[16px] lg:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px] group card"
const cardItem =
  "mt-[10px] md:mt-[45px] font-medium text-xl md:text-[30px] tracking-[0.2px} md:tracking-[0.28px] leading-6 md:leading-[140%] max-w-[350px] lg:max-w-full text-teal-100"
const cardImg = "w-full lg:w-[200px] absolute ml-[40px]"
const sponsor =
  "max-w-[80px] md:max-w-[110px] lg:max-w-[140px] max-h-[80px] mx-auto md:max-0"

const HomeContent = ({
  openAuthModal,
  signIn,
}: {
  openAuthModal: () => unknown
  signIn: () => unknown
}) => {
  const location = useLocation()

  React.useEffect(() => {
    if (new URLSearchParams(location.search).get("auth") === "true") {
      openAuthModal()
    }
  }, [location.search, openAuthModal])

  return (
    <>
      <SnsModal />
      <div className="relative">
        <Container className="relative overflow-visible md:h-[700px]">
          <div className="gradient-radial"></div>
          <div className="relative z-10 pt-[15vh] lg:pt-[150px] md:max-w-[420px] lg:max-w-[520px] xl:max-w-[570px] text-center md:text-left">
            <div className="text-[32px] md:text-[36px] lg:text-[44px] xl:text-[58px] tracking-[-2.16px] font-bold">
              <h1 className="md:leading-[40px] lg:leading-[50px] xl:leading-[64px] gradient-text">
                Your crypto wallet & gateway to ICP apps
              </h1>
            </div>
            <h2
              style={{
                fontFamily: "inherit !important",
              }}
              className="mt-[30px] text-gray-50 md:max-w-[420px] lg:max-w-full text-xl font-inherit font-normal"
            >
              Start exploring ICP applications in seconds. Trusted by hundreds
              of thousands of users worldwide.
            </h2>
            <Button
              id="authentication-button"
              onClick={signIn}
              className="mt-[30px] w-[148px] mx-auto md:mx-0"
              type="primary"
            >
              Go to wallet
            </Button>
          </div>
        </Container>
        <div className="landing-lottie absolute bottom-0 z-0 hidden w-full max-w-[1240px] h-full md:block">
          <Lottie animationData={mainAnmation} autoplay loop />
        </div>
      </div>
      <Container className="mt-[78px] md:mt-0 relative">
        <SnsBanner />
      </Container>
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-10 mt-10 md:justify-between md:mt-20 md:gap-3 lg:gap-12 xl:gap-20">
          <img className={clsx(sponsor)} src={Tomahawk} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Polychain} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Outliers} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Dfinity} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Gmjp} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Rarible} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Yards} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Blockchain} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Flyrfy} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Rubylight} alt="ICP investors" />
          <img className={clsx(sponsor)} src={Spaceship} alt="ICP investors" />
        </div>
      </Container>
      <Container className="mt-10 md:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <img
            src={Audit}
            className="hidden md:block pe-[15px]"
            alt="ICP safest wallet"
          />
          <div className="ms-0 md:ms-[15px] flex flex-col justify-center">
            <div>
              <h2 className="font-bold text-[18px] lg:text-[32px] leading-[140%] text-white mb-[25px]">
                ICP’s safest wallet
              </h2>
              <h3 className="text-white mb-[25px] text-[16px]">
                <span className="block mb-[15px]">
                  NFID Wallet is the only open-source, 3rd-party audited wallet
                  on ICP, and the only project with an all-green audit.
                </span>
                Your gateway to secure, decentralized innovation starts here,
                with NFID Wallet.
              </h3>
            </div>
            <a
              href="https://internet-identity-labs.github.io/nfid-wallet-docs/solidstate_nfid_wallet_audit_report.pdf"
              rel="noreferrer"
              target="_blank"
              className="flex items-center text-teal-300 hover:text-teal-500"
            >
              View audit report <LinkIcon className="ms-1" />
            </a>
          </div>
        </div>
      </Container>
      <Container
        className={clsx(
          "md:rounded-[30px] py-20 md:px-[60px] text-white relative z-10",
          "mt-10 md:mt-20 md:w-[calc(100%-60px)] mx-auto w-full px-[30px] sm:px-0 gradient-box",
        )}
        style={{
          background:
            window.screen.width > 767
              ? "radial-gradient(at right top, #4EAE8A, #12312B 50%, #0B201D 80%)"
              : "",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#12312B",
        }}
      >
        <div className="space-y-20 md:space-y-[100px] z-20 relative md:w-full md:max-w-[1070px] mx-auto">
          <div className={clsx("flex-col lg:flex-row-reverse", section2)}>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[520px] px-5 lg:px-0">
              <p className="font-light text-teal-400">1/4</p>
              <h2 className="font-bold text-[20px] md:text-[28px] lg:text-[32px] leading-[140%]">
                Instant onboarding with your email address
              </h2>
              <h3 className="text-sm md:text-lg text-[teal-100]">
                NFID Wallet makes it easy for you to sign in and sign up to ICP
                websites and apps without downloading additional software or
                navigating complicated setups.
              </h3>
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
              <p className="font-light text-teal-400">2/4</p>
              <h2 className="font-bold text-[20px] md:text-[28px] lg:text-[32px] leading-[140%]">
                Unified account across the ICP ecosystem
              </h2>
              <h3 className="text-sm md:text-lg text-[teal-100]">
                Your privacy is central to NFID Wallet's design philosophy.
                Share your wallet address with apps that serve you and your
                assets, or keep it hidden when you prefer to stay private.
              </h3>
            </div>
            <div className={clsx(asset)}>
              <AnimationWrapper
                animationData={Animation2}
                className="min-w-[330px] min-h-[330px] object-cover"
              />
            </div>
          </div>
          <div className={clsx("flex-col lg:flex-row-reverse", section2)}>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[520px] px-5 lg:px-0">
              <p className="font-light text-teal-400">3/4</p>
              <h2 className="font-bold text-[20px] md:text-[28px] lg:text-[32px] leading-[140%]">
                Greater security with Passkey authentication
              </h2>
              <h3 className="text-sm md:text-lg text-[teal-100]">
                Powered by cutting-edge Passkey and Chainkey technology, NFID
                Wallet shields you from vulnerabilities that compromise even the
                most secure digital platforms.
              </h3>
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
              <p className="font-light text-teal-400">4/4</p>
              <h2 className="font-bold text-[20px] md:text-[28px] lg:text-[32px] leading-[140%]">
                ICP, ICRC, and EXT token support
              </h2>
              <h3 className="text-sm md:text-lg text-[teal-100]">
                NFID Wallet empowers you to seamlessly manage ICP, ICRC-1
                tokens, collectibles, and more, all under the protection of the
                most advanced smart contract platform available.
              </h3>
            </div>
            <div className={clsx(asset)}>
              <AnimationWrapper
                animationData={Animation4}
                className="min-w-[330px] min-h-[330px] object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
      <Container className="mt-[70px] md:mt-[165px]">
        <div className="text-center">
          <h4 className="leading-[120%] md:text-[42px] text-[32px] font-bold tracking-[0.32px] md:tracking-[0.42px] gradient-text">
            Security isn’t a feature. It’s the foundation.
          </h4>
          <h5 className="text-base md:text-[22px] font-bold md:font-light tracking-[0.16px] md:tracking-[0.28px] leading-6 md:leading-8 max-w-[820px] mx-auto mt-[18px] text-gray-50">
            Breakthroughs in cryptography make owning a self-sovereign digital
            identity easier than ever before.
          </h5>
        </div>
        <div className="mt-[27px] md:mt-[98px] grid grid-cols-1 md:grid-cols-2 md:gap-[30px] gap-[20px]">
          <div className={clsx(card)}>
            <div className="gradient-radial-card"></div>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <img
                src={Card1}
                alt="secure ICP wallet"
                className={clsx(cardImg, "z-10")}
              />
              <img
                src={Card1Hover}
                alt="secure wallet"
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <h2 className={clsx(cardItem)}>
              Secured on decentralized architecture built by 100s of the world’s
              best cryptographers.
            </h2>
          </div>
          <div className={clsx(card)}>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <div className="gradient-radial-card"></div>
              <img
                src={Card2}
                alt="protected ICP wallet"
                className={clsx(cardImg, "z-10")}
              />
              <img
                src={Card2Hover}
                alt="protected wallet"
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <h2 className={clsx(cardItem)}>
              Protected by best-in-class auth with enterprise security and
              multi-factor recovery methods.
            </h2>
          </div>
          <div className={clsx(card)}>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <div className="gradient-radial-card"></div>
              <img
                src={Card3}
                alt="trusted ICP wallet"
                className={clsx(cardImg, "z-10")}
              />
              <img
                src={Card3Hover}
                alt="trusted wallet"
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <h2 className={clsx(cardItem)}>
              Trusted by hundreds of thousands of people and businesses around
              the world.
            </h2>
          </div>
          <div className={clsx(card)}>
            <div className="w-[140px] lg:w-[200px] block -ml-7 lg:-ml-[42px] relative aspect-square">
              <div className="gradient-radial-card"></div>
              <img
                src={Card4}
                alt="self-sovereign ICP wallet"
                className={clsx(cardImg, "z-10")}
              />
              <img
                src={Card4Hover}
                alt="self-sovereign wallet"
                className={clsx(
                  cardImg,
                  "z-30 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700",
                )}
              />
            </div>
            <h2 className={clsx(cardItem)}>
              Backed by some of the most trusted names in the crypto and Web3
              industry.
            </h2>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  )
}

export function Home() {
  return <Wrapper pageComponent={HomeContent} />
}
