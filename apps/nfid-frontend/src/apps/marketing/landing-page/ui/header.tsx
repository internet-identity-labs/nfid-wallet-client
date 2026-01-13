import { NFIDLogo } from "@nfid/ui"

import { NFIDAuthentication } from "./auth-modal"
import { Container } from "./container"
import { Socials } from "./socials"

export function Header({
  authModalVisible,
  closeAuthModal,
}: {
  authModalVisible?: boolean
  closeAuthModal: () => unknown
  onAuthClick: () => unknown
}) {
  return (
    <>
      <NFIDAuthentication
        isVisible={!!authModalVisible}
        onClose={closeAuthModal}
      />
      <div className="sticky top-0 z-20">
        <Container className="flex items-center justify-center sm:justify-between py-2.5">
          <NFIDLogo />
          <Socials className="hidden sm:flex" />
        </Container>
      </div>
    </>
  )
}
