import ProfileContainer from "@nfid/ui/atoms/profile-container/Container"
import React from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { MobileIcon } from "@nfid/ui/atoms/icons/mobile"
import { ListItem } from "@nfid/ui/molecules/list/list-item"
import ProfileTemplate from "@nfid/ui/templates/profile-template/Template"
import { useNFIDNavigate } from "@nfid/ui/utils/use-nfid-navigate"

interface IProfileCredentialsPage extends React.HTMLAttributes<HTMLDivElement> {
  phone?: string
  email?: string
  isLoading?: boolean
}

const ProfileCredentialsPage: React.FC<IProfileCredentialsPage> = ({
  phone,
  email: _email,
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
