import clsx from "clsx"
import { motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

import Animation1 from "../../assets/animations/1_4.json"
import Animation2 from "../../assets/animations/2_4.json"
import Animation3 from "../../assets/animations/3_4.json"
import ApproveImg from "../../assets/approve.png"
import Audit from "../../assets/audit.png"
import Card1Hover from "../../assets/cards/icon-1-hover.png"
import Card1 from "../../assets/cards/icon-1.png"
import Card2Hover from "../../assets/cards/icon-2-hover.png"
import Card2 from "../../assets/cards/icon-2.png"
import Card3Hover from "../../assets/cards/icon-3-hover.png"
import Card3 from "../../assets/cards/icon-3.png"
import Card4Hover from "../../assets/cards/icon-4-hover.png"
import Card4 from "../../assets/cards/icon-4.png"
import CenterCoinImg from "../../assets/center-coin.png"
import ConnectionImg from "../../assets/connection.png"
import LockImg from "../../assets/lock.png"
import MainCoinsImg from "../../assets/main-coins.png"
import MainMobImg from "../../assets/mob.png"
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
import SwapArrowsImg from "../../assets/swap-arrows.png"
import SwapCoinsImg from "../../assets/swap-coins.png"
import SwapImg from "../../assets/swap.png"
import TokensCardsImg from "../../assets/tokens-cards.png"
import TokensCoinImg from "../../assets/tokens-coin.png"
import TokensImg from "../../assets/tokens.png"
import { Button } from "../../ui/button"
import { Container } from "../../ui/container"
import { Footer } from "../../ui/footer"
import AnimationWrapper from "../../ui/visible-animation"
import { Wrapper } from "../wrapper"
import { InfoCopy } from "./info-copy"
import { LinkIcon } from "./link-icon"

const asset =
  "my-5 sm:my-0 relative w-full sm:w-[40%] min-w-[330px] min-h-[330px] shrink-0 mx-auto sm:mx-0"
const section2 =
  "flex-col lg:flex-row justify-between block md:flex sm:gap-[60px] items-center"
const card =
  "px-5 bg-[#112525] overflow-hidden relative bg-opacity-40 md:px-[16px] lg:px-[74px] py-[50px] md:pt-[100px] md:pb-[120px] rounded-[30px] group card"
const cardItem =
  "mt-[10px] md:mt-[45px] font-medium text-xl md:text-[30px] tracking-[0.2px} md:tracking-[0.28px] leading-6 md:leading-[140%] max-w-[350px] lg:max-w-full text-teal-100"
const cardImg = "w-full lg:w-[200px] absolute ml-[40px]"
const sponsor =
  "max-w-[80px] md:max-w-[110px] lg:max-w-[140px] max-h-[80px] mx-auto md:max-0"

const useScrollMove = () => {
  const [scrollY, setScrollY] = useState(0)
  const [direction, setDirection] = useState("down")

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setDirection(currentScrollY > lastScrollY ? "down" : "up")
      setScrollY(currentScrollY)
      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return { scrollY, direction }
}

const ScrollMoveElement = ({ img, ...props }: any) => {
  const { scrollY, direction } = useScrollMove()
  const elementRef = useRef(null)
  const [moveAmount, setMoveAmount] = useState(0)
  const [initialPosition, setInitialPosition] = useState<number | null>(null)
  const [isInViewport, setIsInViewport] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
        if (entry.isIntersecting && initialPosition === null) {
          setInitialPosition(entry.boundingClientRect.top)
        }
      },
      { threshold: 0.1 },
    )

    const current = elementRef.current

    if (current) {
      observer.observe(current)
    }

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [initialPosition])

  useEffect(() => {
    if (isInViewport && initialPosition !== null) {
      setMoveAmount((prev) => {
        if (scrollY <= 0) {
          return 0
        } else {
          return prev + (direction === "down" ? -0.3 : 0.3)
        }
      })
    }
  }, [scrollY, direction, isInViewport, initialPosition])

  return (
    <motion.img
      src={img}
      ref={elementRef}
      style={{
        transform: `translateY(${moveAmount}px)`,
        transition: "transform 0.2s ease-out",
      }}
      {...props}
    />
  )
}

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
      <div className="relative">
        <Container className="relative overflow-visible">
          <div className="gradient-radial"></div>
          <div className="relative z-10 pt-[30px] md:pt-[60px] lg:pt-[90px] text-center flex flex-col items-center">
            <div className="text-[30px] md:text-[34px] lg:text-[44px] xl:text-[50px] tracking-[-2.16px] font-bold lg:max-w-[1012px]">
              <h1 className="tracking-normal leading-120 gradient-text">
                The easiest to use, hardest to lose, and only wallet governed by
                a DAO
              </h1>
            </div>
            <h2
              style={{ fontFamily: "inherit !important" }}
              className="text-[18px] lg:text-[22px] relative z-[1] mt-[30px] text-gray-50 md:max-w-[420px] lg:max-w-full font-inherit font-normal lg:max-w-[912px]"
            >
              Secure your assets with the most audited wallet on ICP and start
              exploring ICP applications in seconds. Trusted by hundreds of
              thousands worldwide.
            </h2>
            <div className="flex justify-center relative z-[1]">
              <Button
                id="authentication-button"
                onClick={signIn}
                className="mt-[30px] w-[146px] sm:w-[178px] mr-[10px] sm:mr-[20px]"
                type="primary"
              >
                Go to wallet
              </Button>
              <Button
                onClick={() => window.open("https://learn.nfid.one/", "_blank")}
                className="mt-[30px] w-[146px] sm:w-[178px]"
                type="outline"
              >
                Knowledge base
              </Button>
            </div>
            <div className="relative mt-[-30px] sm:mt-[-70px] md:mt-[-100px] xl:mt-[-180px]">
              <img
                className="max-w-full"
                loading="lazy"
                src="/main.png"
                alt="main"
              />
              <div className="absolute right-[20px] md:right-[75px] top-[120px] md:top-[240px] lg:top-[320px] xl:top-[430px]">
                <ScrollMoveElement
                  className="w-[77px] sm:w-[126px] md:w-[174px] lg:w-[290px]"
                  img={MainMobImg}
                  alt="mob"
                />
              </div>
              <div className="absolute z-[1] left-0 bottom-0">
                <ScrollMoveElement
                  className="w-[220px] sm:w-[500px] xl:w-[830px]"
                  img={MainCoinsImg}
                  alt="mob"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>
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
      <Container
        className={clsx(
          "sm:rounded-[30px] py-20 px-[20px] sm:px-[30px] lg:px-[60px] text-white relative z-10",
          "mt-10 md:mt-20 sm:w-[calc(100%-60px)] mx-auto w-full px-[30px] sm:px-0 gradient-box",
        )}
        style={{
          background:
            window.screen.width > 767
              ? "radial-gradient(at right top, rgb(0, 154, 119), rgb(0, 78, 68) 30%, rgb(3, 32, 28) 70%)"
              : "",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundColor: "rgb(18, 49, 43)",
        }}
      >
        <div className="absolute top-0 left-[50%] mt-[-40px] lg:mt-[-80px]">
          <ScrollMoveElement
            className="w-[140px] lg:w-[256px]"
            img={CenterCoinImg}
            alt="coin"
          />
        </div>
        <div className="text-center mb-[60px] lg:mb-[100px]">
          <h4 className="leading-[130%] text-[32px] lg:text-[48px] font-bold tracking-[0.32px] md:tracking-[0.42px] gradient-text">
            NFID puts ICP on easy mode
          </h4>
          <h5 className="text-[18px] lg:text-[22px] font-bold md:font-light tracking-[0.16px] md:tracking-[0.28px] leading-6 md:leading-8 max-w-[820px] mx-auto mt-[18px] text-gray-50">
            Navigate the ICP network’s tokens, NFTs, and apps with peace of
            mind.
          </h5>
        </div>
        <div className="sm:space-y-20 md:space-y-[100px] z-20 relative md:w-full md:max-w-[1070px] mx-auto">
          <div
            className={clsx(
              "flex-col-reverse sm:!flex-row-reverse !flex md:!mb-[60px]",
              section2,
            )}
          >
            <div className="text-xl sm:text-[24px] space-y-[28px] px-5 sm:pl-0 lg:px-0">
              <p className="font-light text-teal-400 lg:text-[28px] leading-[32px]">
                1/4
              </p>
              <h2 className="font-bold text-[20px] sm:text-[24px] lg:text-[32px] leading-[140%]">
                Instantly swap at the best price, send, and receive tokens
              </h2>
              <h3 className="text-sm sm:text-[18px] text-teal-100 lg:leading-7">
                Say goodbye to sub-optimal swap prices, high network fees and
                slow transfer speeds. Swap, send, and receive tokens quickly for
                less than $0.01.
              </h3>
            </div>
            <div className={clsx(asset, "relative !min-w-auto !min-h-0")}>
              <img
                className="w-[203px] md:w-[359px]"
                src={SwapImg}
                alt="swap"
              />
              <div className="z-[-1] top-[-25px] left-[-25px] md:top-[25px] md:left-[25px] absolute md:scale-125">
                <ScrollMoveElement
                  className="sm:w-[250px] md:w-auto"
                  img={SwapCoinsImg}
                  alt="swap coins"
                />
              </div>
              <div className="absolute bottom-0 left-0 ml-[170px] md:ml-[250px] sm:mb-[70px] md:mb-0">
                <ScrollMoveElement
                  className="w-[83px] md:w-[183px]"
                  img={SwapArrowsImg}
                  alt="swap coins"
                />
              </div>
            </div>
          </div>
          <div
            className={clsx(
              "flex-col-reverse sm:!flex-row !flex md:!mb-[60px]",
              section2,
            )}
          >
            <div className="text-xl sm:text-[24px] space-y-[28px] px-5 sm:pr-0 lg:px-0">
              <p className="font-light text-teal-400 lg:text-[28px] leading-[32px]">
                2/4
              </p>
              <h2 className="font-bold text-[20px] sm:text-[24px] lg:text-[32px] leading-[140%]">
                Securely manage your entire ICP portfolio
              </h2>
              <h3 className="text-sm sm:text-[18px] text-teal-100 lg:leading-7">
                Track token prices in USD, sum up your NFT portfolio with floor
                prices, and keep all your assets safe in NFID Wallet.
              </h3>
            </div>
            <div className={clsx(asset, "relative flex justify-end !min-h-0")}>
              <img
                className="w-[203px] md:w-[359px]"
                src={TokensImg}
                alt="tokens"
              />
              <div className="absolute top-0 right-0 origin-center mr-[140px] sm:scale-[1.4] md:mr-[250px] mt-[-20px] sm:mt-[30px] md:mt-0">
                <ScrollMoveElement
                  className="w-[120px] md:w-[150px]"
                  img={TokensCoinImg}
                  alt="coin"
                />
              </div>
              <div className="absolute z-[-1] top-[20px] right-[100px] sm:!scale-[0.7] sm:ml-[-200px] sm:mt-[-110px]">
                <ScrollMoveElement
                  className="w-[200px] md:w-auto"
                  img={TokensCardsImg}
                  alt="cards"
                />
              </div>
            </div>
          </div>
          <div
            className={clsx(
              "flex-col-reverse sm:!flex-row-reverse md:!mb-[60px] !flex",
              section2,
            )}
          >
            <div className="text-xl sm:text-[24px] space-y-[28px] px-5 sm:pl-0 lg:px-0">
              <p className="font-light text-teal-400 lg:text-[28px] leading-[32px]">
                3/4
              </p>
              <h2 className="font-bold text-[20px] sm:text-[24px] lg:text-[32px] leading-[140%]">
                Connect to the ICP ecosystem of dapps
              </h2>
              <h3 className="text-sm sm:text-[18px] text-teal-100 lg:leading-7">
                Share your wallet address with apps that serve you and your
                assets, or keep it hidden when you prefer to stay private.
              </h3>
            </div>
            <div className={clsx(asset, "!min-h-0")}>
              <img
                className="w-[203px] md:w-[359px]"
                src={ConnectionImg}
                alt="approve connection"
              />
            </div>
          </div>
          <div
            className={clsx("flex-col-reverse sm:!flex-row !flex", section2)}
          >
            <div className="text-xl sm:text-[24px] space-y-[28px] max-w-[520px] px-5 sm:pr-0 lg:px-0">
              <p className="font-light text-teal-400 lg:text-[28px] leading-[32px]">
                4/4
              </p>
              <h2 className="font-bold text-[20px] sm:text-[24px] lg:text-[32px] leading-[140%]">
                Eliminate anxiety with transaction reviews
              </h2>
              <h3 className="text-sm sm:text-[18px] text-teal-100 lg:leading-7">
                Know what you're signing before it's too late, whether for
                transfers, spending limits, or other smart contract calls.
              </h3>
            </div>
            <div
              className={clsx(
                asset,
                "relative flex justify-end !min-h-0 pt-[140px] sm:pt-0",
              )}
            >
              <img
                className="w-[203px] md:w-[359px]"
                src={ApproveImg}
                alt="approve spending cap"
              />
              <div className="absolute top-0 mt-[-100px] left-0 !scale-[0.4] sm:!scale-[0.3] lg:!scale-[0.4] sm:ml-[-380px] lg:ml-[-530px] sm:mt-[-460px]">
                <ScrollMoveElement img={LockImg} alt="lock" />
              </div>
            </div>
          </div>
        </div>
      </Container>
      <Container className="mt-10 md:mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <img src={Audit} className="sm:pr-[15px]" alt="ICP safest wallet" />
          <div className="ms-0 sm:ms-[15px] flex flex-col justify-center">
            <div>
              <h2 className="font-bold text-[18px] lg:text-[32px] leading-[140%] text-white mb-[25px]">
                ICP’s safest wallet
              </h2>
              <h3 className="text-white mb-[25px] text-[14px] lg:text-[18px]">
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
              className="flex items-center text-teal-300 hover:text-teal-500 text-[14px] lg:text-[18px]"
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
              ? "radial-gradient(at right top, rgb(0, 154, 119), rgb(0, 78, 68) 30%, rgb(3, 32, 28) 70%)"
              : "",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundColor: "rgb(18, 49, 43)",
        }}
      >
        <div className="text-center mb-[60px] lg:mb-[100px]">
          <h4 className="leading-[130%] text-[32px] lg:text-[48px] font-bold tracking-[0.32px] md:tracking-[0.42px] gradient-text">
            An evolution in self-sovereign wallets
          </h4>
          <h5 className="text-[18px] lg:text-[22px] font-bold md:font-light tracking-[0.16px] md:tracking-[0.28px] leading-6 md:leading-8 max-w-[820px] mx-auto mt-[18px] text-gray-50">
            The three characteristics that make NFID Wallet stand out in the
            Web3 wallet crowd.
          </h5>
        </div>
        <div className="space-y-20 md:space-y-[100px] z-20 relative md:w-full md:max-w-[1070px] mx-auto">
          <div className={clsx("flex-col lg:flex-row-reverse", section2)}>
            <div className="text-xl md:text-[28px] space-y-[28px] max-w-[520px] px-5 lg:px-0">
              <p className="font-light text-teal-400 lg:text-[28px] leading-[32px]">
                1/3
              </p>
              <h2 className="font-bold text-[20px] md:text-[28px] lg:text-[32px] leading-[140%]">
                Access from anywhere without a phishable recovery phrase
              </h2>
              <h3 className="text-sm text-teal-100 md:text-lg">
                Manage your wallet from any browser on any device by logging in
                with your password or biometric unlock. No complicated setups or
                recovery flows required.
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
              <p className="font-light text-teal-400 lg:text-[28px] leading-[32px]">
                2/3
              </p>
              <h2 className="font-bold text-[20px] md:text-[28px] lg:text-[32px] leading-[140%]">
                Never become one of those “I lost my seed phrase” victims
              </h2>
              <h3 className="text-sm text-teal-100 md:text-lg">
                Seed phrases have been the cause of trillions of dollars in
                crypto losses. Get the benefits of self-custody without them.
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
              <p className="font-light text-teal-400 lg:text-[28px] leading-[32px]">
                3/3
              </p>
              <h2 className="font-bold text-[20px] md:text-[28px] lg:text-[32px] leading-[140%]">
                Earn $NFIDW rewards for participating in governance
              </h2>
              <h3 className="text-sm text-teal-100 md:text-lg">
                While every other Web3 wallet generates profits for the
                corporations that built them, NFID Wallet is the only one whose
                stakeholders—you—are rewarded for participating.
              </h3>
            </div>
            <div className={clsx(asset)}>
              <AnimationWrapper
                animationData={Animation3}
                className="min-w-[330px] min-h-[330px] object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
      <Container className="mt-[70px] md:mt-[165px]">
        <div className="text-center">
          <h4 className="leading-[130%] text-[32px] lg:text-[48px] font-bold tracking-[0.32px] md:tracking-[0.42px] gradient-text">
            Security isn’t a feature. It’s the foundation.
          </h4>
          <h5 className="text-[18px] lg:text-[22px] font-bold md:font-light tracking-[0.16px] md:tracking-[0.28px] leading-6 md:leading-8 max-w-[820px] mx-auto mt-[18px] text-gray-50">
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
              Independently audited and open-source
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
              Protected by next generation passkey security
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
            <h2 className={clsx(cardItem)}>No seed phrase</h2>
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
            <h2 className={clsx(cardItem)}>100% self-custody</h2>
          </div>
        </div>
      </Container>
      <Container className="p-[20px] bg-opacity-40 lg:py-[40px] lg:px-[34px] bg-[#112525] rounded-[30px] my-[30px] lg:my-[100px]">
        <InfoCopy
          text="$NFIDW Ledger Canister ID"
          value="mih44-vaaaa-aaaaq-aaekq-cai"
          withBorder
        />
        <InfoCopy
          text="$NFIDW Index Canister ID"
          value="mgfru-oqaaa-aaaaq-aaelq-cai"
          withBorder
        />
        <InfoCopy
          text="Dev Team Beacon Neuron"
          value="333b4d86cf09ec61ddc0858bdbaaa2c9b9cff0b6b5ac284004603ee5fc08fb87"
        />
      </Container>
      <Footer />
    </>
  )
}

export function Home() {
  return <Wrapper pageComponent={HomeContent} />
}
