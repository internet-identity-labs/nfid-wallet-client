import clsx from "clsx"
import React from "react"
import { Fade } from "react-awesome-reveal"
import { Link } from "react-router-dom"
import { Parallax, ParallaxProvider } from "react-scroll-parallax"

import { useDeviceInfo } from "@nfid/integration"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { loadProfileFromLocalStorage } from "frontend/integration/identity-manager/profile"
import { Accordion } from "frontend/ui/atoms/accordion"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import Arrow from "./assets/arrow.svg"
import Blur1 from "./assets/blur_1.svg"
import Blur2 from "./assets/blur_green.png"
import Icon_yellow from "./assets/blur_pink.png"
import Icon1 from "./assets/nfid_icon_1.svg"
import Icon2 from "./assets/nfid_icon_2.svg"
import Icon3 from "./assets/nfid_icon_3.svg"
import Icon_pink from "./assets/nfid_pink.svg"

import { Footer } from "./footer"
import { HeroLeftSide } from "./hero-left-side"
import { NFIDAuthentication } from "./hero-right-side"
import "./index.css"
import { questions } from "./questions"
import { SocialButtons } from "./social-buttons"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const HomeScreen: React.FC<Props> = ({ children, className }) => {
  const { profile } = useAccount()
  const { isMobile } = useDeviceInfo()

  const [isRegistered, setIsRegistered] = React.useState(true)
  React.useEffect(() => {
    const profile = loadProfileFromLocalStorage()
    setIsRegistered(!!profile)
  }, [])

  return (
    <AppScreen
      showLogo
      bubbleOptions={{
        showBubbles: false,
      }}
      classNameWrapper=""
    >
      <main
        className={clsx(
          "bg-gradient-to-b from-white to-[#F3F8FE] overflow-hidden sm:overflow-clip scroll-smooth landing-page flex flex-1",
          "-mt-[10vh]",
        )}
      >
        <div
          className={clsx("container px-6 py-0 mx-auto sm:py-4", "mt-[10vh]")}
        >
          <ParallaxProvider>
            <div
              className={`font-inner ${isMobile ? `mobile` : ``} ${
                profile ? `has-account` : ``
              }`}
            >
              <section
                id="home"
                className="grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 scroll-mt-20"
              >
                <div className="relative">
                  <HeroLeftSide isUnregistered={!profile} />
                  <Parallax speed={isMobile ? undefined : -300}>
                    <p className="absolute text-[25vw] opacity-[0.02] z-0 left-0 font-bold">
                      Identity
                    </p>
                  </Parallax>
                </div>
                <div className="relative">
                  <img
                    className="absolute z-0 w-[275%] -left-40 md:w-[210%] top-[-35rem] sm:top-[-60rem] md:-top-40 max-w-none md:left-[-85%] blur-blue"
                    src={Blur1}
                    alt="blur1"
                  />
                  <NFIDAuthentication isUnregistered={!isRegistered} />
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade right>
                    <Parallax
                      className="relative font-bold"
                      speed={isMobile ? undefined : -10}
                    >
                      <p className="flex justify-end text-[32px] text-black opacity-10 font-extralight mb-5">
                        1/3
                      </p>
                      <p className="leading-[34px] text-[28px] md:text-[32px] z-20 md:leading-[40px]">
                        Sign in, privately
                      </p>
                      <p className="z-20 mt-5 text-base font-normal md:text-lg md:leading-[26px]">
                        Traditionally, you give applications your email address
                        or other reusable identifier as a way of identifying
                        you. Unfortunately, this immediately links you with all
                        the other accounts you’ve ever used that same identifier
                        for. When you connect to applications with NFID, you’re
                        giving that application a completely new random
                        identifier for yourself that they can’t associate with
                        any of your other internet accounts.
                      </p>
                    </Parallax>
                  </Fade>
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade right>
                    <img
                      className="absolute z-0 w-[200%] max-w-none left-[-100%] mt-80 blur-green"
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
                        Buy, send, and swap tokens, privately
                      </p>
                      <p className="mt-5 text-base font-normal md:text-lg md:leading-[26px]">
                        Crypto wallets have explored ways of sending and
                        receiving data, like cryptocurrencies and NFTs. What
                        they haven’t been able to do is protect their owners
                        from surveillance of all trading activity. NFID grants
                        you protection from this kind of surveillance by keeping
                        your assets siloed in app-specific wallets until you
                        choose to reveal them.
                      </p>
                    </Parallax>
                  </Fade>
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade right>
                    <Parallax
                      className="relative z-20 font-bold mt-[25vh] md:mt-[65vh]"
                      speed={isMobile ? undefined : -10}
                    >
                      <p className="flex justify-end text-[32px] text-black opacity-10 font-extralight mb-5">
                        3/3
                      </p>
                      <p className="text-[28px] md:text-[32px] leading-[34px] md:leading-[40px]">
                        Share your data, privately
                      </p>
                      <p className="mt-5 text-base font-normal md:text-lg md:leading-[26px]">
                        Today’s tech giants are data monopolies — they share and
                        sell your data without your consent and share none of
                        the profits. Invert the power dynamic with NFID — ask
                        not what you can do for your applications, ask what your
                        applications can do for you! That’s right, never fill
                        out the same form twice with NFID.
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
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade left>
                    <h2 className="z-10 font-bold text-white text-titleMobile md:text-titleLarge">
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
                    </h2>
                  </Fade>
                  <Parallax speed={isMobile ? undefined : 15}>
                    <p className="absolute text-[25vw] opacity-[0.03] z-30 -right-[15vw] font-bold top-[420px]">
                      NFID
                    </p>
                  </Parallax>
                  <div className="grid grid-cols-1 gap-24 mt-20 text-white md:grid-cols-2">
                    {/* @ts-ignore: TODO: Pasha fix */}
                    <Fade bottom>
                      <div className="">
                        <div className="icon-background-blur private-background-blur big-background-blur"></div>
                        <div className="icon-background-blur private-background-blur small-background-blur"></div>
                        <img src={Icon1} alt="Private" />
                        <p className="text-[28px] md:text-[32px] mt-5 font-bold leading-[34px] md:leading-10">
                          Private
                        </p>
                        <p className="mt-5 text-base md:text-lg md:leading-[26px]">
                          Every account you create across any service that
                          supports NFID will automatically create a new,
                          untraceable hardware wallet. You are the only person
                          in the world able to trace accounts to your NFID,
                          providing you with the best possible privacy online.
                        </p>
                      </div>
                    </Fade>
                    {/* @ts-ignore: TODO: Pasha fix */}
                    <Fade bottom>
                      <div className="">
                        <div className="icon-background-blur convenient-background-blur big-background-blur"></div>
                        <div className="icon-background-blur convenient-background-blur small-background-blur"></div>
                        <img src={Icon2} alt="Convenient" />
                        <p className="text-[28px] md:text-[32px] mt-5 font-bold leading-[34px] md:leading-10">
                          Convenient
                        </p>
                        <p className="mt-5 text-base md:text-lg md:leading-[26px]">
                          A hardware device for each online account used to be
                          impractical. NFID stores private keys on the
                          specially-designed cryptographic chips of your phones,
                          tablets, and computers so that creating new accounts
                          or authenticating is simply a face or touch scan away.
                        </p>
                      </div>
                    </Fade>
                    {/* @ts-ignore: TODO: Pasha fix */}
                    <Fade bottom>
                      <div className="">
                        <div className="icon-background-blur secure-background-blur big-background-blur"></div>
                        <div className="icon-background-blur secure-background-blur small-background-blur"></div>
                        <img src={Icon3} alt="Secure" />
                        <p className="text-[28px] md:text-[32px] mt-5 font-bold leading-[34px] md:leading-10">
                          Secure
                        </p>
                        <p className="mt-5 text-base md:text-lg md:leading-[26px]">
                          Hardware wallets offer the greatest security
                          guarantees because their private keys can't be
                          exported, making it a one-way vault that only you have
                          the ability to access. NFID makes each of your
                          internet accounts exactly this kind of vault.
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
                  className="absolute right-8 blur-pink"
                />
                <div>
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade left>
                    <h2 className="font-bold text-titleMobile md:text-titleLarge">
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
                    </h2>
                  </Fade>
                </div>
                <div className="relative">
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade>
                    <div className="relative z-20 text-base md:text-xl">
                      <div className="text-base md:mt-5 md:text-lg md:leading-[26px]">
                        <p>
                          At Internet Identity Labs, our mission is to provide
                          every human with the freedom to move digital assets,
                          freedom to speak our minds, and freedom from targeted
                          manipulation, all with the security and simplicity of
                          the native face or fingerprint scan of our personal
                          devices. We see a future where we can’t be subject to
                          targeted manipulation because our activity can’t be
                          tracked across accounts, where we can speak our minds
                          because creating an account reveals no personal
                          information about ourselves, and where we can move our
                          digital assets without revealing who we are or the
                          accounts in which our assets were stored.
                        </p>{" "}
                        <p className="my-5">
                          What we believe is simple: The internet should be{" "}
                          <strong>our</strong> internet, nobody else's.
                        </p>{" "}
                      </div>
                      {/* <Link
                    to="/our-mission"
                    className="flex text-xl font-semibold transition-all text-blue-base hover:opacity-50 hover:underline hover:text-blue-hover"
                  >
                    Read more <img className="ml-2" src={Arrow} alt="" />
                  </Link> */}
                    </div>
                  </Fade>
                </div>
              </section>
              {/* <section className="relative grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 pt-36 md:pt-72">
            <div>
              <Fade left>
                <h2 className="font-bold text-titleMobile md:text-titleLarge lg:whitespace-nowrap">
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
                </h2>
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
                className="relative grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 pt-36 md:pt-72 md:-scroll-mt-24"
              >
                <div className="top-28">
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade left>
                    <h2 className="font-bold text-titleMobile md:text-titleLarge">
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
                    </h2>
                  </Fade>
                </div>
                {/* @ts-ignore: TODO: Pasha fix */}
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
                      className="flex mt-5 text-xl font-semibold transition-all text-blue-base hover:opacity-50 hover:underline hover:text-blue-hover"
                    >
                      Read more <img className="ml-2" src={Arrow} alt="" />
                    </Link>
                  </div>
                </Fade>
              </section>
              <section className="relative grid grid-cols-1 md:grid-cols-[5fr,7fr] gap-10 pt-36 md:pt-72">
                <div className=" top-28">
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade left>
                    <h2 className="font-bold text-titleMobile md:text-titleLarge">
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
                    </h2>
                  </Fade>
                </div>
                {/* @ts-ignore: TODO: Pasha fix */}
                <Fade>
                  <SocialButtons />
                </Fade>
              </section>
            </div>
            <Footer />
          </ParallaxProvider>
        </div>
      </main>
    </AppScreen>
  )
}
