import React from "react"
import { useNavigate } from "react-router-dom"

import { IconCmpArrowRight, TableCell, TableRow } from "@nfid-frontend/ui"

export interface VaultsTableRowProps {
  name: string
  walletsQuantity: number
  membersQuantity: number
  lastActivity: string
  id: string
}

export const VaultsTableRow: React.FC<VaultsTableRowProps> = ({
  name,
  walletsQuantity,
  membersQuantity,
  lastActivity,
  id,
}: VaultsTableRowProps) => {
  const navigate = useNavigate()

  return (
    <TableRow onClick={() => navigate(`url/${id}`)}>
      <TableCell isLeft>{name}</TableCell>
      <TableCell centered>{walletsQuantity}</TableCell>
      <TableCell centered>{membersQuantity}</TableCell>
      <TableCell>{lastActivity}</TableCell>
      <TableCell isRight>
        <IconCmpArrowRight className="ml-auto text-gray-400" />
      </TableCell>
    </TableRow>
  )
}
