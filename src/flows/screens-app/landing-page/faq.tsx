import { Accordion } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
// @ts-ignore
import { Fade } from "react-reveal"
import { ParallaxProvider } from "react-scroll-parallax"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { Footer } from "./footer"
import { questions } from "./questions"

interface FaqProps {}

export const Faq: React.FC<FaqProps> = ({ children }) => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: false,
      }}
    >
      <main
        className={clsx(
          "bg-gradient-to-b from-white to-[#F3F8FE] landing-page flex flex-1",
        )}
      >
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <ParallaxProvider>
            <div className="font-inter">
              <section
                id="faq"
                className="relative grid grid-cols-1 sm:grid-cols-[5fr,7fr] gap-10 mt-20"
              >
                <div className="top-28">
                  <Fade left>
                    <h1 className="font-bold text-titleMobile sm:text-titleLarge">
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
          </ParallaxProvider>
          <Footer />
        </div>
      </main>
    </AppScreen>
  )
}
