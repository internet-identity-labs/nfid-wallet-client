import React from "react"

import { Button, IconCmpInfo } from "@nfid-frontend/ui"

const UserNavigation = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <div className="flex space-x-4">
      {isAuthenticated ? (
        <Button type="primary" icon={<IconCmpInfo />} isSmall>
          My Delegation
        </Button>
      ) : (
        <Button type="primary" isSmall>
          Authenticate
        </Button>
      )}
    </div>
  )
}

export default UserNavigation
