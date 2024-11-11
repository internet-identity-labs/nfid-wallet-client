import { Link } from "react-router-dom"

import { NFIDLogo } from "@nfid-frontend/ui"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"

import { AuthButton } from "./auth-button"
import { NFIDAuthentication } from "./auth-modal"
import { Container } from "./container"

export function Header({
  authModalVisible,
  closeAuthModal,
  onAuthClick,
}: {
  authModalVisible?: boolean
  closeAuthModal: () => unknown
  onAuthClick: () => unknown
}) {
  const { isAuthenticated } = useAuthentication()

  return (
    <>
      <NFIDAuthentication
        isVisible={!!authModalVisible}
        onClose={closeAuthModal}
      />
      <div className="sticky top-0 z-20">
        <Container className="flex items-center justify-between py-2.5">
          <NFIDLogo />
          <div className="flex items-center text-sm font-semibold">
            <Link
              className="mr-[50px] hidden md:inline-block text-white hover:text-[#2DEECB] transition-all"
              to="/sns"
            >
              Sns
            </Link>
            <a
              href="https://learn.nfid.one/"
              target="_blank"
              className="mr-[50px] hidden md:inline-block text-white hover:text-[#2DEECB] transition-all"
              rel="noreferrer"
            >
              Knowledge base
            </a>
            <AuthButton
              isAuthenticated={isAuthenticated}
              onAuthClick={onAuthClick}
            />
          </div>
        </Container>
      </div>
    </>
  )
}
