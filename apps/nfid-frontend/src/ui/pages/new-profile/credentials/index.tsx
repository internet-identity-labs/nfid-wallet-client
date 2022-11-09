import React from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { MobileIcon } from "frontend/ui/atoms/icons/mobile"
import { Loader } from "frontend/ui/atoms/loader"
import { ListItem } from "frontend/ui/molecules/list/list-item"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface IProfileCredentialsPage extends React.HTMLAttributes<HTMLDivElement> {
  phone?: string
  email?: string
  isLoading?: boolean
}

const ProfileCredentialsPage: React.FC<IProfileCredentialsPage> = ({
  phone,
  email,
  isLoading = false,
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
            onClick={() => navigate(`${ProfileConstants.addPhoneNumber}`)}
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
