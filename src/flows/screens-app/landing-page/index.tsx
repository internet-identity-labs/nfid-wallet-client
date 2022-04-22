import { Accordion } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
// @ts-ignore
import { Fade } from "react-reveal"
import { Link } from "react-router-dom"
import { Parallax, ParallaxProvider } from "react-scroll-parallax"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useDeviceInfo } from "frontend/hooks/use-device-info"

import Arrow from "./assets/arrow.svg"
import Blur1 from "./assets/blur_1.svg"
import Blur2 from "./assets/blur_2.svg"
import Icon1 from "./assets/nfid_icon_1.svg"
import Icon2 from "./assets/nfid_icon_2.svg"
import Icon3 from "./assets/nfid_icon_3.svg"
import Icon_pink from "./assets/nfid_pink.svg"
import Icon_yellow from "./assets/nfid_yellow.svg"
import Discord from "./assets/social/discord.svg"
import Github from "./assets/social/github.svg"
import Twitter from "./assets/social/twitter.svg"

import { Footer } from "./footer"
import { HeroLeftSide } from "./hero-left-side"
import { HeroRightSide } from "./hero-right-side"
import { questions } from "./questions"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface Props
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement> {
}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  const { account } = useAccount()
  const { isMobile } = useDeviceInfo()

  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: false,
      }}
      classNameWrapper="bg-gradient-to-b from-white to-[#F3F8FE] overflow-hidden sm:overflow-clip scroll-smooth"
    >
      <ParallaxProvider>
        <div className="font-inter">
          <section
            id="home"
            className="grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10"
          >
            <div className="relative">
              <HeroLeftSide isQRCode={!account} />
              <Parallax speed={isMobile ? undefined : -170}>
                <p className="absolute text-[25vw] opacity-[0.02] z-0 left-0 font-bold">
                  Identity
                </p>
              </Parallax>
            </div>
            <div className="relative">
              <img
                className="absolute z-0 w-[275%] -left-40 md:w-[210%] top-[-60rem] md:-top-40 max-w-none md:left-[-85%]"
                src={Blur1}
                alt="blur1"
              />
              <HeroRightSide isQRCode={!account} />
              <Fade right>
                <Parallax
                  className="relative font-bold"
                  speed={isMobile ? undefined : -10}
                >
                  <p className="flex justify-end text-[32px] text-black opacity-10 font-extralight mb-5">
                    1/3
                  </p>
                  <p className="leading-[34px] text-[28px] md:text-[32px] z-20 md:leading-[40px]">
                    Digital wallets are a revolution in online identity
                    management
                  </p>
                  <p className="z-20 mt-5 text-base font-normal md:text-lg md:leading-[26px]">
                    In today's surveillance society where everything about us is
                    collected and sold between government and industry, digital
                    wallets have the potential of offering us a way out.
                  </p>
                </Parallax>
              </Fade>
              <Fade right>
                <img
                  className="absolute z-0 w-[200%] max-w-none left-[-100%] mt-80"
                  src={Blur2}
                  alt="blur2"
                />
                <Parallax
                  className="relative z-20 font-bold mt-[25vh] md:mt-[65vh]"
                  speed={isMobile ? undefined : -10}
                >
                  <p className="flex justify-end text-[32px] text-black opacity-10 font-extralight mb-5">
                    2/3
                  </p>
                  <p className="text-[28px] md:text-[32px] leading-[34px] md:leading-[40px]">
                    It's what we self-custody our identity credentials and
                    digital assets with
                  </p>
                  <p className="mt-5 text-base font-normal md:text-lg md:leading-[26px]">
                    Like physical wallets, digital wallets keep our digital
                    items — cryptocurrencies, NFTs, vaccine cards, diplomas,
                    identity credentials, etc — away from thieves.
                  </p>
                </Parallax>
              </Fade>
              <Fade right>
                <Parallax
                  className="relative z-20 font-bold mt-[25vh] md:mt-[65vh]"
                  speed={isMobile ? undefined : -10}
                >
                  <p className="flex justify-end text-[32px] text-black opacity-10 font-extralight mb-5">
                    3/3
                  </p>
                  <p className="text-[28px] md:text-[32px] leading-[34px] md:leading-[40px]">
                    But today's wallets all suffer from the same problems
                  </p>
                  <p className="mt-5 text-base font-normal md:text-lg md:leading-[26px]">
                    Online or software-based wallets can still be hacked,
                    hardware wallets are hard to use, and no matter the type,
                    all our online activity can still be tracked and associated
                    to us personally.
                  </p>
                </Parallax>
              </Fade>
            </div>
          </section>
          <section
            id="only-with-nfid"
            className="mt-[20vh] md:mt-[40vh] py-[6rem] md:py-[120px] mb-[60px] md:mb-[120px] bg-[#3D3F56] only-with-nfid relative scroll-mt-10"
          >
            <div className="relative z-10">
              <Fade left>
                <h1 className="z-10 font-bold text-white text-titleMobile md:text-titleLarge">
                  Only with{" "}
                  <span
                    style={{
                      WebkitTextFillColor: "transparent",
                      background:
                        "linear-gradient(90deg, #00DE59 -0.08%, #009382 100%)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    NFID
                  </span>
                </h1>
              </Fade>
              <Parallax speed={isMobile ? undefined : 15}>
                <p className="absolute text-[25vw] opacity-[0.03] z-30 -right-[15vw] font-bold top-[420px]">
                  NFID
                </p>
              </Parallax>
              <div className="grid grid-cols-1 gap-24 mt-20 text-white md:grid-cols-2">
                <Fade bottom>
                  <div className="">
                    <img src={Icon1} alt="Private" />
                    <p className="text-[28px] md:text-[32px] mt-5 font-bold leading-[34px] md:leading-10">
                      Private
                    </p>
                    <p className="mt-5 text-base md:text-lg md:leading-[26px]">
                      Every account you create across any service that supports
                      NFID will automatically create a new, untraceable hardware
                      wallet. You are the only person in the world able to trace
                      accounts to your NFID, providing you with the best
                      possible privacy online.
                    </p>
                  </div>
                </Fade>
                <Fade bottom>
                  <div className="">
                    <img src={Icon2} alt="Convenient" />
                    <p className="text-[28px] md:text-[32px] mt-5 font-bold leading-[34px] md:leading-10">
                      Convenient
                    </p>
                    <p className="mt-5 text-base md:text-lg md:leading-[26px]">
                      A hardware device for each online account used to be
                      impractical. NFID stores private keys on the
                      specially-designed cryptographic chips of your phones,
                      tablets, and computers so that creating new accounts or
                      authenticating is simply a face or touch scan away.
                    </p>
                  </div>
                </Fade>
                <Fade bottom>
                  <div className="">
                    <img src={Icon3} alt="Secure" />
                    <p className="text-[28px] md:text-[32px] mt-5 font-bold leading-[34px] md:leading-10">
                      Secure
                    </p>
                    <p className="mt-5 text-base md:text-lg md:leading-[26px]">
                      Hardware wallets offer the greatest security guarantees
                      because their private keys can't be exported, making it a
                      one-way vault that only you have the ability to access.
                      NFID makes each of your internet accounts exactly this
                      kind of vault.
                    </p>
                  </div>
                </Fade>
              </div>
            </div>
          </section>
          <section
            id="our-mission"
            className="relative grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 md:pt-24 scroll-mt-24"
          >
            <img
              src={Icon_pink}
              alt="Ellipse_pink"
              className="absolute z-0 -top-16 right-16"
            />
            <img
              src={Icon_yellow}
              alt="Ellipse_yellow"
              className="absolute right-8"
            />
            <div>
              <Fade left>
                <h1 className="font-bold text-titleMobile md:text-titleLarge">
                  Our{" "}
                  <span
                    style={{
                      WebkitTextFillColor: "transparent",
                      background:
                        "linear-gradient(90deg, #B649FF -0.08%, #FF9029 100.12%)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    mission
                  </span>
                </h1>
              </Fade>
            </div>
            <div className="relative">
              <Fade>
                <div className="relative z-20 text-base md:text-xl">
                  <div className="text-base md:mt-5 md:text-lg md:leading-[26px]">
                    <p>
                      At Internet Identity Labs, our mission is to provide every
                      human with the freedom to move digital assets, freedom to
                      speak our minds, and freedom from targeted manipulation,
                      all with the security and simplicity of the native face or
                      fingerprint scan of our personal devices. We see a future
                      where we can’t be subject to targeted manipulation because
                      our activity can’t be tracked across accounts, where we
                      can speak our minds because creating an account reveals no
                      personal information about ourselves, and where we can
                      move our digital assets without revealing who we are or
                      the accounts in which our assets were stored.
                    </p>{" "}
                    <p className="my-5">
                      What we believe is simple: The internet should be{" "}
                      <span className="font-bold">our</span> internet, nobody
                      else's.
                    </p>
                  </div>
                  <Link
                    to="/our-mission"
                    className="flex font-semibold transition-all text-blue-base hover:opacity-50 hover:underline hover:text-blue-hover"
                  >
                    Read more <img className="ml-2" src={Arrow} alt="" />
                  </Link>
                </div>
              </Fade>
            </div>
          </section>
          {/* <section className="relative grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 pt-36 md:pt-72">
            <div>
              <Fade left>
                <h1 className="font-bold text-titleMobile md:text-titleLarge lg:whitespace-nowrap">
                  Where you can <br />{" "}
                  <span
                    style={{
                      WebkitTextFillColor: "transparent",
                      background:
                        "linear-gradient(90deg, #B649FF -0.08%, #FF9029 100.12%)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    {" "}
                    use NFID today
                  </span>
                </h1>
              </Fade>
            </div>
            <div className="w-full">
              <Fade>
                <div className="grid grid-cols-2 gap-4 mt-6 md:flex md:flex-wrap md:gap-5 md:justify-between">
                  {objects.map((object) => (
                    <div
                      style={{
                        width: `calc(${
                          !isMobile ? `${object.width} - 1rem` : "100%"
                        } )`,
                      }}
                      className="h-16 bg-red-200 rounded"
                    />
                  ))}
                </div>
              </Fade>
            </div>
          </section> */}
          <section
            id="faq"
            className="relative grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 pt-36 md:pt-72"
          >
            <div className="top-28">
              <Fade left>
                <h1 className="font-bold text-titleMobile md:text-titleLarge">
                  Frequently <br />
                  asked {""}
                  <span
                    style={{
                      WebkitTextFillColor: "transparent",
                      background:
                        "linear-gradient(90deg, #00DE59 -0.08%, #009382 100%)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    questions
                  </span>
                </h1>
              </Fade>
            </div>
            <Fade>
              <div className="relative">
                {questions.slice(0, 5).map((question, i) => (
                  <Accordion
                    title={question.title}
                    details={question.info}
                    key={i}
                    className="border-b xl:text-lg"
                  />
                ))}
                <Link
                  to={"/faq"}
                  className="flex mt-5 font-semibold transition-all text-blue-base hover:opacity-50 hover:underline hover:text-blue-hover"
                >
                  Read more <img className="ml-2" src={Arrow} alt="" />
                </Link>
              </div>
            </Fade>
          </section>
          <section className="relative grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 pt-36 md:pt-72">
            <div className=" top-28">
              <Fade left>
                <h1 className="font-bold text-titleMobile md:text-titleLarge">
                  Our {""}
                  <span
                    style={{
                      WebkitTextFillColor: "transparent",
                      background:
                        "linear-gradient(90.02deg, #0094FF -5.65%, #A400CD 99.96%)",
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    socials
                  </span>
                </h1>
              </Fade>
            </div>
            <Fade>
              <div className="grid justify-between grid-cols-2 gap-5 md:flex">
                <a href="#!" target="_blank" rel="noreferrer">
                  <img
                    src={Discord}
                    alt="discord"
                    className="duration-300 hover:shadow-lightBlue"
                  />
                </a>
                <a
                  href="https://twitter.com/IdentityMaxis"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={Twitter}
                    alt="twitter"
                    className="duration-300 hover:shadow-lightCyan"
                  />
                </a>
                <a
                  href="https://github.com/internet-identity-labs"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={Github}
                    alt="github"
                    className="duration-300 hover:shadow-lightGray"
                  />
                </a>
              </div>
            </Fade>
          </section>
        </div>
        <Footer />
      </ParallaxProvider>
    </AppScreen>
  )
}
