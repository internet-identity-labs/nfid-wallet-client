import { useCallback, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

import "../index.css"
import { Header } from "../ui/header"

export function Wrapper({
  pageComponent: PageComponent,
}: {
  pageComponent: React.ComponentType<{
    openAuthModal: () => unknown
    signIn: () => unknown
  }>
}) {
  const navigate = useNavigate()
  const [themeColor, setThemeColor] = useState("")
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false)
  const { isAuthenticated } = useAuthentication()

  useEffect(() => {
    document.body.classList.add("homescreen")
    setThemeColor("#0E0F10")

    return () => {
      document.body.classList.remove("homescreen")
      setThemeColor("#ffffff")
    }
  }, [])

  const signIn = useCallback(() => {
    return isAuthenticated
      ? navigate(`${ProfileConstants.base}/${ProfileConstants.tokens}`)
      : setIsAuthModalVisible(true)
  }, [isAuthenticated, navigate])

  const openAuthModal = useCallback(
    () => setIsAuthModalVisible(true),
    [setIsAuthModalVisible],
  )

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <meta name="theme-color" content={themeColor} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href="/main.png" />
      </Helmet>
      <Header
        authModalVisible={isAuthModalVisible}
        closeAuthModal={() => setIsAuthModalVisible(false)}
        onAuthClick={signIn}
      />
      <PageComponent openAuthModal={openAuthModal} signIn={signIn} />
    </div>
  )
}
