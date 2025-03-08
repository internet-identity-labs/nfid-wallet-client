import clsx from "clsx"
import { useState, useMemo, HTMLAttributes, FC, MouseEvent } from "react"
import { useNavigate } from "react-router-dom"

import ProfileContainer from "../../atoms/profile-container/Container"

export interface StakingProps {}

export const Staking: FC<StakingProps> = ({}) => {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  return (
    <>
      <ProfileContainer>123</ProfileContainer>
      <ProfileContainer>456</ProfileContainer>
    </>
  )
}
