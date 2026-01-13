import React from "react"

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
    <div className="flex flex-col flex-grow w-full h-full gap-4">
      {header}
      {body}
      {footer}
    </div>
  )
}

Page.Header = ({ children }) => {
  return <header>{children}</header>
}

Page.Body = ({ children }) => {
  return <main className="flex flex-col flex-1">{children}</main>
}

Page.Footer = ({ children }) => {
  return <footer className={"flex flex-col flex-0 w-full"}>{children}</footer>
}
