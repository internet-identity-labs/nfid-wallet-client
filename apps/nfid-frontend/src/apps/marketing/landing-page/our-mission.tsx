import clsx from "clsx"
import React from "react"
import { Fade } from "react-awesome-reveal"
import { ParallaxProvider } from "react-scroll-parallax"

import { Image } from "@nfid-frontend/ui"

import { ScrollTopOnNavigate } from "frontend/ui/templates/ScrollTopOnNavigate"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import Blur3 from "./assets/blur_3.png"

import { Footer } from "./footer"

export default function OurMission() {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: false,
      }}
      classNameWrapper=""
    >
      <ScrollTopOnNavigate />
      <main
        className={clsx(
          "bg-gradient-to-b from-white to-[#F3F8FE] overflow-x-hidden sm:overflow-auto landing-page flex flex-1",
        )}
      >
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <ParallaxProvider>
            <div className="font-inter">
              <section
                id="our-mission"
                className="relative grid grid-cols-1 sm:grid-cols-[5fr,7fr] gap-10 sm:pt-24"
              >
                <Image
                  className="absolute z-0 w-50% top-64 -left-[20vw]"
                  src={Blur3}
                  alt="blur3"
                />
                <div className="top-28">
                  {/* @ts-ignore: TODO: Pasha fix */}
                  <Fade left>
                    <h2 className="font-bold text-titleMobile sm:text-titleLarge">
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
                    <div className="relative z-20 text-base sm:text-lg sm:leading-[26px] tracking-[0.01em]">
                      <div className="sm:mt-5">
                        <p className="font-bold text-xl leading-[26px] sm:leading-[34px] sm:text-[28px]">
                          Central powers use our online activity
                        </p>
                        <p className="mt-[10px] sm:mt-5">
                          Central powers use our online activity to limit our
                          freedoms, silence our opinions, and manipulate our
                          behavior. The war in Ukraine is just one of many
                          examples: Ukrainians today by the hundreds of
                          thousands are facing difficulty accessing existing and
                          opening new bank accounts, protestors in Russia
                          against the war risk detainment for speaking out
                          against the government, and the Russian propaganda
                          machine is working so well partly because it’s able to
                          run hyper-targeted messaging campaigns from the
                          massive amount of information we unknowingly reveal
                          about ourselves.
                        </p>
                      </div>
                      <div className="sm:mt-5">
                        <p className="font-bold text-xl leading-[26px] sm:leading-[34px] sm:text-[28px] mt-[60px]">
                          Our identities aren’t really ours
                        </p>
                        <p className="mt-[10px] sm:mt-5">
                          This is the world we live in today because our
                          identities aren’t really ours, they belong to the
                          companies and governments that provide us with the
                          promise of security and convenience in exchange for
                          our privacy. Sign in with Big Tech to exchange
                          no-password log-ins for surveillance of our online
                          activity on a previously unimaginable scale. Receive a
                          single number, passport, or identification card from
                          the government to exchange how we prove we are who we
                          say we are for surveillance anytime those documents
                          are used. Keep money in a bank to exchange the
                          convenience of its (relative) safe-keeping for the
                          surveillance and control of its use.
                        </p>
                      </div>
                      <div className="sm:mt-5">
                        <p className="font-bold text-xl leading-[26px] sm:leading-[34px] sm:text-[28px] mt-[60px]">
                          We are not free
                        </p>
                        <p className="mt-[10px] sm:mt-5">
                          We are not free to move our money without risking its
                          seizure, we are not free to speak our mind without
                          risking consequences, and we are not free from
                          becoming the subject of targeted manipulation until
                          we’re in control of our own identity. Until today,
                          achieving this level of freedom was either impossible
                          or impractically inconvenient.
                        </p>
                      </div>
                      <div className="sm:mt-5">
                        <p className="font-bold text-xl leading-[26px] sm:leading-[34px] sm:text-[28px] mt-[60px]">
                          Internet Identity Labs mission
                        </p>
                        <p className="mt-[10px] sm:mt-5">
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
                        </p>
                        <br />
                        <p className="mt-4 font-bold">
                          What we believe is simple: The internet should be our
                          internet, nobody else's.
                        </p>
                      </div>
                    </div>
                  </Fade>
                </div>
              </section>
            </div>
          </ParallaxProvider>
          <Footer />
        </div>
      </main>
    </AppScreen>
  )
}
