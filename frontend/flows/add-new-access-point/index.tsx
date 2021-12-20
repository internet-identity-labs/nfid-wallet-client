import React from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import { AuthWrapper } from "../auth-wrapper"
import { AwaitingConfirmation } from "./awaiting-confirmation"
import { CopyLinkToChannel } from "./copy-link-to-channel"
import { CreateKeysScreen } from "./create-keys"

export const AddNewAccessPointRoutes = () => (
  <Routes>
    <Route path="new-access-point/" element={<AddNewAccessPoint />}>
      <Route
        path="copy-link-to-channel"
        element={
          <AuthWrapper>
            <CopyLinkToChannel />
          </AuthWrapper>
        }
      />
      <Route path="awaiting-confirmation" element={<AwaitingConfirmation />} />
      <Route path="create-keys/:secret" element={<CreateKeysScreen />} />
    </Route>
  </Routes>
)

const AddNewAccessPoint = () => <Outlet />
