import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import React from "react"

import {
  MobileIcon,
  ListItem,
  ProfileTemplate,
  useNFIDNavigate,
} from "@nfid-frontend/ui"

interface IProfileCredentialsPage extends React.HTMLAttributes<HTMLDivElement> {
  phone?: string
  email?: string
  isLoading?: boolean
  addPhoneNumberRoute?: string
}

const ProfileCredentialsPage: React.FC<IProfileCredentialsPage> = ({
  phone,
  email,
  isLoading = false,
  addPhoneNumberRoute = "/profile/credentials/add-phone-number",
}) => {
  const { navigate } = useNFIDNavigate()

  return (
    <ProfileTemplate pageTitle="Credentials" isLoading={isLoading}>
      <ProfileContainer
        title="Issued by Internet Identity Labs"
        subTitle="Shareable verified data"
        className="relative"
      >
        {isLoading ? (
          <ListItem
            disabled={true}
            icon={<MobileIcon />}
            title={"Loading..."}
          />
        ) : (
          <ListItem
            disabled={!!phone?.length}
            icon={<MobileIcon />}
            title={phone?.length ? phone : "Connect mobile phone number"}
            onClick={() => navigate(addPhoneNumberRoute)}
            id={
              phone?.length
                ? "phone-number-value"
                : "connect-mobile-phone-number"
            }
          />
        )}
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileCredentialsPage
