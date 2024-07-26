import { useRef } from "react"

import loader from "./NFID_Wallet_Dark.webm"

export const NFIDLogo = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <video
      ref={videoRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-[170px] object-cover relative bg-transparent"
      muted
      src={loader}
    ></video>
  )
}
