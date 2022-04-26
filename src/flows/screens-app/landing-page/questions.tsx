import { Link } from "react-router-dom"

import { ProfileConstants } from "../profile/routes"

export const questions = [
  {
    title: "What is NFID?",
    info: "NFID is the most private, secure, and convenient way to sign in to third-party apps and websites using the devices you already own. When you see a Continue with NFID prompt on a participating app or website, it means you can set up an account using your NFID. No more usernames or passwords to manage, no more loss of privacy, and no more identity theft or theft of the cryptocurrency you’re holding.",
  },
  {
    title: "How is this different than a cryptocurrency wallet?",
    info: "NFID creates a new cryptocurrency wallet for every account you create with NFID that can't be traced to each other, and only NFID offers the ability to create accounts and authenticate quickly and securely across all of your devices using the face or touch scan from those same devices. No more browser plugins or standalone apps to download and manage.",
  },
  {
    title: "What if my device is lost or stolen?",
    info: (
      <ul>
        <li>
          <strong className="pr-1">A</strong> – use one of your registered
          devices to remove the lost or stolen device from your list of NFID{" "}
          <Link
            className="text-blue-base hover:underline hover:text-blue-hover"
            to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
          >
            authorized devices
          </Link>
          .
        </li>
        <li>
          <strong className="pr-1">B</strong> – remotely lock the lost or stolen
          device to prevent anyone from using it. Follow{" "}
          <Link
            to="#"
            className="text-blue-base hover:underline hover:text-blue-hover"
          >
            these
          </Link>{" "}
          instructions for Apple, these for Google, these for Microsoft.
        </li>
        <li>
          <strong className="pr-1">C</strong> – if you have no other registered
          devices, use your recovery phrase to temporarily authenticate yourself
          and remove the lost device from your list of NFID{" "}
          <Link
            className="text-blue-base hover:underline hover:text-blue-hover"
            to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
          >
            authorized devices
          </Link>
          .
        </li>
      </ul>
    ),
  },
  {
    title: "Why don’t you offer passwords or other methods of authentication?",
    info: "Other authentication methods are the culprit for over 80% of all security hacks and data breaches because a username and password is all an attacker needs to impersonate you. NFID makes it impossible for anyone to breach any of your accounts without your device and the ability to unlock it.",
  },
  {
    title:
      "What if I don’t have a device with a face or touch scanner, or a security key?",
    info: (
      <>
        Please email us at{" "}
        <a
          href="mailto:hello@identitylabs.ooo"
          className="text-blue-base hover:underline hover:text-blue-hover"
        >
          hello@identitylabs.ooo
        </a>{" "}
        or let us know in the feedback channel of our Discord server - we want
        to make sure everyone has a self-sovereign identity that’s impossible to
        breach. If you don’t yet have a biometric-capable device, we want to
        hear from you.",
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
          className="text-blue-base hover:underline hover:text-blue-hover"
        >
          support article
        </a>{" "}
        about the privacy and security of the biometric on your devices.
      </>
    ),
  },
  {
    title: "Could someone steal my NFID and impersonate me online?",
    info: "Unlike every other identity system in the world today, the only way to steal an NFID is to steal the device and be able to unlock it before that device is locked. Or if someone forces an NFID owner to unlock their own device.",
  },
  {
    title: "How is my name used?",
    info: "Your name is encrypted and only accessible to you. Its only use is to make it easier for you to see which NFID you’re unlocking.",
  },
  {
    title: "How is my phone number used?",
    info: "Your phone number is encrypted and only accessible to you. Applications will sometimes want to know you’re a unique human being before making some features available. An encrypted phone number is a reasonable first step in qualifying a unique person, and is exponentially more private and secure than using a different unique identifier like a social security number.",
  },
]
