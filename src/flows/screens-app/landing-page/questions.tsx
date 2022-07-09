import { Link } from "react-router-dom"

import { ProfileConstants } from "../profile/routes"

export const questions = [
  {
    title: "What is NFID?",
    info: (
      <p>
        NFID is an app-less, strong portable authenticator built on Dfinity
        Foundation's{" "}
        <a
          className="font-semibold transition-all text-blue-600 hover:opacity-50 hover:underline hover:text-blue-500"
          href="https://smartcontracts.org"
          target="_blank"
          rel="noreferrer"
        >
          Internet Computer
        </a>{" "}
        and leverages Dfinity's{" "}
        <a
          className="font-semibold transition-all text-blue-600 hover:opacity-50 hover:underline hover:text-blue-500"
          href="https://smartcontracts.org/docs/ic-identity-guide/what-is-ic-identity.html#id-overview"
          target="_blank"
          rel="noreferrer"
        >
          Internet Identity
        </a>
        , the strongest trustless cryptographic delegation system on the
        Internet. NFID uses FIDO-based biometrics for secure, frictionless, and
        consistent authentication. With one click to create new accounts or sign
        into existing ones, NFID eliminates passwords and the inconveniences of
        traditional credential-based logins.
      </p>
    ),
  },
  {
    title: "How is this different than my  current cryptocurrency wallet?",
    info: (
      <p>
        There are four major questions to ask about wallets:
        <ul className="mt-1 mb-4">
          <li>How much privacy do they provide?</li>
          <li>How secure are they from breaches?</li>
          <li>How exactly is this my "identity"?</li>
          <li>How convenient are they to use?</li>
        </ul>
        <div className="mb-3">
          <strong>Privacy</strong>
          <p className="mt-2">
            When you sign in to applications with your current wallet, you're
            essentially introducing yourself to that application with your bank
            account number. The more applications you do this with and the more
            transacion history you create, the more you incentivize attackers to
            find your real-life identity. NFID actually generates a new
            hybrid-hardware wallet for every account you create on every website
            and application that can only be linked to each other by you, the
            owner of those accounts.
          </p>
        </div>
        <div className="mb-3">
          <strong>Security</strong>
          <p className="mt-2">
            Proving ownership of a private key is the most secure means of
            authentication, and every wallet now has some way of storing them.
            There is a difference in how they're stored, which has more to do
            with convenience, but ultimately the best private key storage is the
            kind that makes exporting from the device impossible. Some wallets
            offer that (NFID being one of them), though most don't. What's not
            been discussed often enough is how vulnerable the interface is
            between you and you private key. If that interface is hosted on
            centralized Web2 architecture like AWS or Apple/Google, it's an
            attack vector since governments, the company itself, or individual
            attackers all have ways of gaining access or even deactivating the
            interface. All wallets today have interfaces served from centralized
            architecture except NFID, which is served from the Internet
            Computer.
          </p>
        </div>
        <div className="mb-3">
          <strong>Identity</strong>
          <p className="mt-2">
            Authenticating yourself to applications on the internet should keep
            you anonymous and protected from impersonation by default, but you
            should also be able to prove you are a unique human being. For
            example if you're creating an account with a regulated entity like a
            bank, you'll need to complete KYC/AML procedures. If you're
            registering with a DAO, the process should protect against voting
            manipulation or resource extraction. Some wallets take an approach
            of requiring pre-authorization (i.e. KYC), others require
            registering a photo or video of yourself for community approval, and
            some rely on other services to issue your wallet a credential
            attesting you are a unique human (further risking exposure of your
            identity since it's issued to the same wallet identifier). NFID
            takes the approach that there will be many services attesting many
            different things about you. Every application you sign in with NFID
            can issue that specific identifier a credential that can be used
            across applications without revealing the identifier it was issued
            to. Strong privacy. Strong security. Flexible identity credentialing
            capabilities.
          </p>
        </div>
        <div className="mb-3">
          <strong>Convenience</strong>
          <p className="mt-2">
            The best experience of creating accounts with other services is the
            one that requires zero effort. Today's wallets all experience the
            same inconveniences because they require authentication from a
            specific device that an app was downloaded to. One-touch across any
            of your desktops, tablets, and phones is all that's required for
            private and secure multi-factor authentication to any website or
            application. No download required.
          </p>
        </div>
      </p>
    ),
  },
  {
    title: "What if my device is lost or stolen?",
    info: (
      <div>
        <div className="mb-6">
          A - Use one of your registered devices to remove the lost or stolen
          device from your list of NFID{" "}
          <Link
            className="text-blue-600 hover:underline hover:text-blue-500"
            to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
          >
            authorized devices
          </Link>
          .
        </div>
        <div className="mb-6">
          B – remotely lock the lost or stolen device to prevent anyone from
          using it. Follow the instructions for{" "}
          <Link
            to="https://support.apple.com/en-us/HT201472"
            className="text-blue-600 hover:underline hover:text-blue-500"
          >
            Apple
          </Link>
          , for{" "}
          <Link
            to="https://support.google.com/accounts/answer/6160491"
            className="text-blue-600 hover:underline hover:text-blue-500"
          >
            Google
          </Link>
          , for{" "}
          <Link
            to="https://support.microsoft.com/account-billing/find-and-lock-a-lost-windows-device-890bf25e-b8ba-d3fe-8253-e98a12f26316"
            className="text-blue-600 hover:underline hover:text-blue-500"
          >
            Microsoft
          </Link>
          .
        </div>
        <div className="mb-6">
          C – if you have no other registered devices, use your recovery phrase{" "}
          <span className="font-bold">
            only on the{" "}
            <a
              className="text-blue-600 hover:underline hover:text-blue-500"
              href="https://nfid.one"
            >
              https://nfid.one
            </a>{" "}
            landing page
          </span>{" "}
          to temporarily authenticate yourself and remove the lost device from
          your list of NFID (
          <Link
            className="text-blue-600 hover:underline hover:text-blue-500"
            to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
          >
            authorized devices
          </Link>
          ). If you have no other registered devices, use your recovery phrase
          to temporarily authenticate yourself and remove the lost device from
          your list of NFID .
        </div>
      </div>
    ),
  },
  {
    title: "Why don't you offer passwords or other methods of authentication?",
    info: "Other authentication methods are the culprit for over 80% of all security hacks and data breaches because a username and password is all an attacker needs to impersonate you. NFID makes it impossible for anyone to breach any of your accounts without your device and the ability to unlock it. We are currently developing a safer alternative that will let you register an NFID with your social accounts, email address, and phone numbers, but it will be discouraged since each has been proven insecure.",
  },
  {
    title:
      "What if I don't have a device with a face or touch scanner, or a security key?",
    info: (
      <>
        Please email us at{" "}
        <a
          href="mailto:hello@identitylabs.ooo"
          className="text-blue-600 hover:underline hover:text-blue-500"
        >
          hello@identitylabs.ooo
        </a>{" "}
        or let us know in the feedback channel of our Discord server — we want
        to make sure everyone has a privacy-preserving self-sovereign identity
        that's impossible to breach. If you don't yet have a biometric-capable
        device, we want to hear from you.
      </>
    ),
  },
  {
    title: "Is my face or touch data being stored on some server?",
    info: (
      <>
        No. This data never leaves your device. Apple wrote a{" "}
        <a
          href="https://support.apple.com/en-us/HT208108"
          className="text-blue-600 hover:underline hover:text-blue-500"
        >
          support article
        </a>{" "}
        about the privacy and security of the biometric on your devices.
      </>
    ),
  },
  {
    title: "How can I access my NFID wallet?",
    info: "The NFID wallet is currently in development and scheduled for release over the next few months.",
  },
  {
    title: "Could someone steal my NFID and impersonate me online?",
    info: "Unlike every other identity system in the world today, the only way to steal an NFID is to steal the device and be able to unlock it before that device is locked. We are incredibly grateful to the Dfinity Foundation's cryptography team for having created such a secure environment on which we can build.",
  },
  {
    title: "How is my personal information used?",
    info: "Your personal information is encrypted and only accessible to you. Personalizing your experience with NFID, whether it's adding your name, email address, or phone number, is meant only to make it easier for you to use and easier for you to provide other applications, should they request this information from you.",
  },
  {
    title: "How is my phone number used?",
    info: "Your phone number is encrypted and only accessible to you. Applications will sometimes want to know you're a unique human being before making some features available. When you share an obfuscated version of your phone number to applications, they will never be able to de-obfuscate it back to your actual number. We've received feedback from the community that this is a reasonable first step in qualifying a unique person, though we're already developing even more sybil-resistant credentials.",
  },
  {
    title: "Why is the URL some crazy string of numbers and letters?",
    info: "When we navigate to a URL today, a domain name service (DNS) is responsible for routing our request for data to the appropriate server that contains it. Although we don't think of it as such, that DNS is a centralized organization with a substantial influence over how we navigate the Internet. The Internet Computer's aim is to build a decentralized cloud computing platform that doesn't rely on any centralized organization to run web-scale applications. The URLs you see can easily be replaced with the traditionally-named domains we're used to, but developers building on the Internet Computer have mostly chosen not to so that they may show their users the site runs on end-to-end decentralized architecture.",
  },
  {
    title:
      "The Internet Computer sounds cool, where can I learn more about it?",
    info: (
      <>
        <p>
          We suggest starting with a look through their extensive documentation{" "}
          <a
            href="https://dfinity.org/howitworks/"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
      </>
    ),
  },
]
