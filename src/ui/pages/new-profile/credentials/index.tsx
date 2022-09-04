import React from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { MobileIcon } from "frontend/ui/atoms/icons/mobile"
import { ListItem } from "frontend/ui/molecules/list/list-item"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

interface IProfileCredentialsPage extends React.HTMLAttributes<HTMLDivElement> {
  phone?: string
  email?: string
}

const ProfileCredentialsPage: React.FC<IProfileCredentialsPage> = ({
  phone,
  email,
}) => {
  const { navigate } = useNFIDNavigate()

  return (
    <ProfileTemplate pageTitle="Credentials">
      <ProfileContainer
        title="Issued by Internet Identity Labs"
        subTitle="Shareable verified data"
      >
        <ListItem
          disabled={!!phone?.length}
          icon={<MobileIcon />}
          title={phone?.length ? phone : "Connect mobile phone number"}
          onClick={() => navigate(`${ProfileConstants.addPhoneNumber}`)}
        />
        {/* <ListItem
          // disabled={!!email?.length}
          disabled
          icon={<GmailIcon />}
          title={email ?? "Connect Gmail"}
          onClick={() => {}}
        /> */}
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileCredentialsPage
