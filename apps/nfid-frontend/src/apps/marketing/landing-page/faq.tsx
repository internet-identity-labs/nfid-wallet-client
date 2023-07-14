import clsx from "clsx"
import React from "react"
import { Fade } from "react-awesome-reveal"



import { Accordion } from "frontend/ui/atoms/accordion"
import { ScrollTopOnNavigate } from "frontend/ui/templates/ScrollTopOnNavigate"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import Blur from "./assets/blur_green.png"

import { Footer } from "./footer"
import { questions } from "./questions"
import { SocialButtons } from "./social-buttons"

export const Faq = () => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: false,
      }}
      showLogo
    >
      <ScrollTopOnNavigate />
      <main
        className={clsx(
          "bg-gradient-to-b from-white to-[#F3F8FE] landing-page flex flex-1",
        )}
      >
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <div className="font-inter">
            <section
              id="faq"
              className="relative grid grid-cols-1 sm:grid-cols-[5fr,7fr] gap-10 mt-20"
            >
              <img
                className="absolute z-0 w-50% top-36 -left-[30vw]"
                src={Blur}
                alt="blur"
              />
              <div className="top-28">
                {/* @ts-ignore: TODO: Pasha fix */}
                <Fade left>
                  <h2 className="font-bold text-titleMobile sm:text-titleLarge">
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
                  {questions.map((question, i) => (
                    <Accordion
                      title={question.title}
                      details={question.info}
                      key={i}
                      className="border-b xl:text-lg"
                    />
                  ))}
                </div>
              </Fade>
            </section>
          </div>
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
          <Footer />
        </div>
      </main>
    </AppScreen>
  )
}

export default Faq
