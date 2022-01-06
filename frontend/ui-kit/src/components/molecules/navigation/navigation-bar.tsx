import React from "react"
import { HiMenu } from "react-icons/hi"
import { Logo } from "../../atoms/images/logo"
import { NavigationLink } from "./navigation-link"

export const NavigationBar: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = React.useState<boolean>(false)

  return (
    <header className="flex flex-none items-center bg-white shadow-sm z-1">
      <div className="container xl:max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between py-4">
          <div className="flex items-center">
            <Logo nav />
          </div>

          <div className="flex items-center space-x-1 lg:space-x-5">
            <nav className="hidden lg:flex lg:items-center lg:space-x-2">
              <NavigationLink href={"/"} text={"Home"} />
              <NavigationLink
                href={"/register/confirmation/this-is-a-fake-secret"}
                text={"Register Confirmation"}
              />
              <NavigationLink
                href={"/link-internet-identity"}
                text={"Link InternetIdentity"}
              />
              <NavigationLink href={"/copy-devices"} text={"Copy Devices"} />
            </nav>

            <div className="lg:hidden">
              <button
                type="button"
                className="inline-flex justify-center items-center space-x-2 border font-semibold focus:outline-none px-3 py-2 leading-6 rounded border-gray-300 bg-white text-gray-800 shadow-sm hover:text-gray-800 hover:bg-gray-100 hover:border-gray-300 hover:shadow focus:ring focus:ring-gray-500 focus:ring-opacity-25 active:bg-white active:border-white active:shadow-none"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                <HiMenu className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="lg:hidden">
            <nav className="flex flex-col space-y-2 py-4 border-t">
              <NavigationLink href={"/"} text={"Home"} />
              <NavigationLink
                href={"/register-confirmation/this-is-a-fake-secret"}
                text={"Register Confirmation"}
              />
              <NavigationLink
                href={"/link-internet-identity"}
                text={"Link InternetIdentity"}
              />
              <NavigationLink href={"/copy-devices"} text={"Copy Devices"} />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
