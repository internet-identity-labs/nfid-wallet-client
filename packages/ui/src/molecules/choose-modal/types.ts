import { ReactNode } from "react"

export interface IGroupOption {
  title: string
  subTitle?: string
  innerTitle?: string
  innerSubtitle?: string
  icon?: string
  value: string
  badgeText?: string
}

export interface IGroupedOptions {
  label: string
  options: IGroupOption[]
}

export interface IGroupedSendAddress {
  id: string
  title: string
  subTitle?: string
  value?: string
  icon?: ReactNode
}
