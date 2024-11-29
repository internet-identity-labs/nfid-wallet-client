import clsx from "clsx"
import { useEffect } from "react"

import coinsImg from "../../assets/coins.png"
import colChartImg from "../../assets/column-chart.png"
import daoImg from "../../assets/dao.png"
import pieChartImg from "../../assets/nfidw-pie-chart.png"
import { Container } from "../../ui/container"
import { Footer } from "../../ui/footer"
import { Wrapper } from "../wrapper"

function SnsContent() {
  useEffect(() => {
    localStorage.setItem("sns-page-visited", "true")
  }, [])

  return (
    <>
      <div className="gradient-radial"></div>
      <Container className="relative overflow-visible md:pb-[50px] relative">
        <img className="sns-top-img" src={coinsImg} alt="NFIDW token" />
        <div className="relative z-10 pt-[10vh] md:pt-[5vh] lg:pt-[70px] md:max-w-[520px] lg:max-w-[650px]">
          <div className="text-[32px] lg:text-[48px] md:text-[36px] tracking-[-2.16px] font-bold mb-[30px]">
            <h1 className="md:leading-[45px] lg:leading-[120%] gradient-text text-center md:text-left">
              Launching NFID Wallet DAO with the $NFIDW token
            </h1>
          </div>
          <ul className="list-disc text-lg ms-[19px]">
            <li className="text-gray-50 mb-[15px]">
              While decentralized technologies have evolved rapidly, the $50b
              wallet market remains largely centralized.
            </li>
            <li className="text-gray-50 mb-[15px]">
              NFID Wallet aims to empower individuals across the globe by
              offering a meaningful role in shaping the infrastructure that
              supports Web3.
            </li>
            <li className="text-gray-50 mb-[15px]">
              $NFIDW is being launched to decentralize governance of NFID
              Wallet’s protocol, interfaces, $NFIDW token supply and ecosystem
              growth.
            </li>
            <li className="text-gray-50">
              Join the{" "}
              <a
                href="https://discord.gg/a9BFNrYJ99"
                rel="noreferrer"
                target="_blank"
                className="text-teal-300 hover:text-teal-500"
              >
                NFID Labs discord
              </a>{" "}
              for the latest update on when $NFIDW will be available for
              swapping with $ICP
            </li>
          </ul>
        </div>
      </Container>
      <Container
        className={clsx(
          "md:rounded-[30px] pt-20 md:px-[60px] text-white relative z-10",
          "mt-[10vh] md:mt-0 md:w-[calc(100%-60px)] mx-auto w-full px-[30px] md:px-0",
        )}
        style={{
          background:
            window.screen.width > 767
              ? "radial-gradient(at right top, #1A4437, #000000 55%, #0e0f10 70%)"
              : "radial-gradient(at right top, #000000, #0e0f10 70%)",
        }}
      >
        <div className="md:w-full md:max-w-[834px] mx-auto">
          <h2 className="font-bold text-[20px] sm:text-[28px] lg:text-[32px] leading-[140%] text-white mb-[20px]">
            NFID Wallet — critical infrastructure to give anyone a voice in
            wallet development
          </h2>
          <h3 className="text-sm md:text-lg text-white">
            <span className="block mb-[15px]">
              When Bitcoin was introduced, it provided the first glimpse of what
              decentralization could achieve — a financial system without
              intermediaries, driven by the people. Since then, the vision of a
              decentralized world has continued to expand, with blockchains
              transforming industries from finance to gaming.{" "}
            </span>
            <span className="block mb-[15px]">
              However, despite the rapid evolution of decentralized
              technologies, there remains a key area that is still largely
              centralized: the $50 billion wallet market. Wallets, the essential
              tool for enabling self-sovereign control, remain under the
              governance of a select few. As a result, people lack true
              influence over the infrastructure that supports Web3.{" "}
            </span>
            <span className="block mb-[15px]">
              NFID Wallet is already playing a pivotal role in the ICP
              ecosystem, serving over 500,000 users and supporting nearly 100%
              of applications deployed on ICP. It’s the fastest way for users to
              enter the Web3 ecosystem and has addressed one of the primary
              challenges other wallets face— permanent loss of access.{" "}
            </span>
            The mission of NFID Wallet is to empower people globally by
            providing a meaningful role in shaping the infrastructure that
            powers Web3. It’s being realized through the issuance of $NFIDW
            governance tokens, enabling decentralized decision-making, and
            supporting the growth of the Internet Computer Protocol.
          </h3>
          <h2 className="font-bold text-[20px] sm:text-[28px] lg:text-[32px] leading-[140%] text-white mb-[20px] mt-[50px]">
            Decentralizing the future of NFID Wallet
          </h2>
          <h3 className="text-sm md:text-lg text-white">
            <span className="block mb-[15px]">
              Decentralization has always been the defining goal of NFID Wallet.
              ICP was specifically chosen as the foundation for NFID Wallet
              because it is the only network capable of securely supporting such
              a multi-chain application at scale.
            </span>
            <span className="block mb-[15px]">
              {" "}
              To bring this vision to life, the NFID Wallet team raised $4
              million from leading investors, including Polychain, Tomahawk,
              Blockchain Founders Fund, Outliers Fund, architects of ICP’s
              Internet Identity, and others. These partners share a commitment
              to building a wallet that is truly governed by its users.
            </span>{" "}
            Now, with the launch of the NFID Wallet DAO, governance will be
            decentralized and led by $NFIDW holders, who will collectively
            steward the project and help guide its future.
          </h3>
          <img className="w-full mt-[20px] mb-[50px]" src={daoImg} alt="DAO" />
          <h2 className="font-bold text-[20px] sm:text-[28px] lg:text-[32px] leading-[140%] text-white mb-[20px] mt-[50px]">
            $NFIDW allocation and governance
          </h2>
          <h3 className="text-sm md:text-lg text-white">
            <span className="block mb-[15px]">
              To fully realize a decentralized governance structure, NFID Wallet
              is proposed to transition into a DAO through the ICP’s SNS
              launchpad. This will allow anyone to acquire $NFIDW and stake it
              to actively participate in governing the future of NFID Wallet.
            </span>
          </h3>
        </div>
      </Container>
      <Container
        className={clsx(
          "md:px-[60px] text-white relative z-10",
          "md:w-[calc(100%-60px)] mx-auto w-full px-[30px] md:px-0 mt-0",
        )}
      >
        <div className="md:w-full md:max-w-[834px] mx-auto">
          <h3 className="text-sm md:text-lg text-white">
            No single entity or individual will hold more than 10% of the
            initial token supply, ensuring broad and decentralized control. The
            initial token distribution for NFID Wallet DAO is structured as
            follows:
          </h3>
          <img
            className="w-full mt-[20px] mb-[25px]"
            src={pieChartImg}
            alt="$NFIDW Allocation Chart"
          />
          <h3 className="text-sm md:text-lg text-white mb-[50px]">
            With this initial governance structure, NFID Wallet is sufficiently
            decentralized at the outset and will continue to further
            decentralize over time, with more users, contributors and token
            holders.
          </h3>
          <h2 className="font-bold text-[20px] sm:text-[28px] lg:text-[32px] leading-[140%] text-white mb-[20px]">
            Buyback-and-burn: a proposal for $NFIDW supply sustainability
          </h2>
          <h3 className="text-sm md:text-lg text-white">
            <span className="block mb-[15px]">
              While the decision for managing the $NFIDW supply lies with the
              NFID Wallet DAO, we propose that the community consider a model in
              which the total supply of $NFIDW is maintained at approximately
              3.14159 billion.
            </span>
            <span className="block mb-[15px]">
              As the ICP DeFi ecosystem and NFID Wallet’s in-app swap volumes
              grow, the fees generated could be used to help balance the annual
              token issuance for governance rewards. Through a buyback-and-burn
              mechanism, these fees could be used to purchase $NFIDW, which the
              DAO may then vote to burn, ensuring long-term sustainability of
              the token supply.
            </span>
            <span className="block mb-[15px]">
              As part of a potential token supply management strategy, the NFID
              Wallet DAO could propose using fees generated from in-app swaps to
              reduce the circulating supply of $NFIDW. If the ICP DeFi ecosystem
              continues to grow and usage patterns align with major wallets in
              other ecosystems, the swap fees could be used to purchase $NFIDW
              from the market, which the DAO may then vote to burn.
            </span>{" "}
            This approach would be designed to maintain long-term sustainability
            and balance within the NFID Wallet ecosystem, rather than for
            speculation or profit.
          </h3>
          <img
            className="w-full mt-[20px] mb-[50px]"
            src={colChartImg}
            alt="$NFIDW Reward/Burn Chart"
          />
          <h2 className="font-bold text-[20px] sm:text-[28px] lg:text-[32px] leading-[140%] text-white mb-[20px]">
            Call to claim $NFIDW and get involved
          </h2>
          <h3 className="text-sm md:text-lg text-white">
            <span className="block mb-[15px]">
              Join the{" "}
              <a
                href="https://discord.gg/a9BFNrYJ99"
                rel="noreferrer"
                target="_blank"
                className="text-teal-300 hover:text-teal-500"
              >
                NFID Labs discord
              </a>{" "}
              for the latest update on when $NFIDW will be available for
              swapping with $ICP
            </span>
            <span className="block mb-[15px]">
              $NFIDW will be non-transferable at the outset until each
              participant decides to un-stake their tokens.
            </span>
            There are many ways to be involved in the NFID Wallet community. To
            get more involved with NFID Wallet governance join the NFID{" "}
            <a
              className="text-teal-300 hover:text-teal-500"
              target="_blank"
              href="https://discord.gg/a9BFNrYJ99"
              rel="noreferrer"
            >
              Discord
            </a>{" "}
            and follow{" "}
            <a
              className="text-teal-300 hover:text-teal-500"
              href="https://twitter.com/@NFIDWallet"
              target="_blank"
              rel="noreferrer"
            >
              @NFIDWallet
            </a>{" "}
            on X.
          </h3>
        </div>
      </Container>
      <Footer />
    </>
  )
}

export function Sns() {
  return <Wrapper pageComponent={SnsContent} />
}
