import React from "react"

import { ScreenResponsive } from "../screen-responsive"

type PageProps = {
  children: React.ReactNode
}

type HeaderProps = {
  children: React.ReactNode
}

type BodyProps = {
  children: React.ReactNode
}

type FooterProps = {
  children: React.ReactNode
}

type PageCompoundComponents = {
  Header: React.FC<HeaderProps>
  Body: React.FC<BodyProps>
  Footer: React.FC<FooterProps>
}

export const Page: React.FC<PageProps> & PageCompoundComponents = ({
  children,
}) => {
  const childrenArray = React.Children.toArray(children)

  const header = childrenArray.find(
    (child) => (child as React.ReactElement).type === Page.Header,
  ) as React.ReactElement

  const body = childrenArray.find(
    (child) => (child as React.ReactElement).type === Page.Body,
  ) as React.ReactElement

  const footer = childrenArray.find(
    (child) => (child as React.ReactElement).type === Page.Footer,
  ) as React.ReactElement

  return (
    <ScreenResponsive>
      {header}
      {body}
      {footer}
    </ScreenResponsive>
  )
}

Page.Header = ({ children }) => {
  return <header>{children}</header>
}

Page.Body = ({ children }) => {
  return <main>{children}</main>
}

Page.Footer = ({ children }) => {
  return <footer>{children}</footer>
}
