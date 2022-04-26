import {
  P,
  List,
  H5,
  ListItem,
  PlusIcon,
  ModalAdvancedProps,
  H3,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { generatePath, Link } from "react-router-dom"

import { ListItemPlaceholder } from "frontend/design-system/molecules/placeholders/list-item"
import { PoaBanner } from "frontend/design-system/molecules/poa-banner"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { AppScreenProofOfAttendencyConstants } from "frontend/flows/screens-app/proof-of-attendancy/routes"
import { ProfileHomeMenu } from "frontend/screens/profile/profile-home-menu"
import { Device } from "frontend/services/identity-manager/devices/state"
import { IIPersona } from "frontend/services/identity-manager/persona/types"
import { PublicKey } from "frontend/services/internet-identity/generated/internet_identity_types"
import { getUrl } from "frontend/utils"

import { DeviceListItem } from "./device-list-item"

interface Account {
  anchor: string
  name?: string
}

type Application = string

interface ProfileProps {
  onDeleteDeviceFactory: (publicKey: PublicKey) => () => Promise<void>
  setModalOptions: (options: ModalAdvancedProps | null) => void
  setShowModal: (state: boolean) => void
  modalOptions: ModalAdvancedProps | null
  showModal?: boolean
  account?: Account
  devices: Device[]
  applications: Application[]
  loading?: boolean
  hasPoa?: boolean
  personas: IIPersona[]
}

export const Profile: React.FC<ProfileProps> = ({
  onDeleteDeviceFactory,
  setModalOptions,
  setShowModal,
  showModal,
  modalOptions,
  account,
  applications,
  devices,
  loading,
  hasPoa,
  personas: iiPersonas = [],
}) => {
  const myApplications = React.useMemo(() => {
    // Group iiPersonas by hostname and count the number of iiPersonas
    const iiPersonasByHostname = iiPersonas.reduce((acc, iiPersona) => {
      const hostname = getUrl(iiPersona.domain).hostname.split(".")[0]
      const applicationName =
        hostname.charAt(0).toUpperCase() + hostname.slice(1)
      const iiPersonas = acc[applicationName] || []
      acc[applicationName] = [...iiPersonas, iiPersona]

      return acc
    }, {} as { [applicationName: string]: IIPersona[] })

    // Map the iiPersonas by application to an array of objects
    const iiPersonasByHostnameArray = Object.entries(iiPersonasByHostname).map(
      ([applicationName, iiPersonas]) => {
        return {
          applicationName,
          iiPersonas,
          iiPersonasCount: iiPersonas.length,
        }
      },
    )

    return iiPersonasByHostnameArray
  }, [iiPersonas])

  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#a69cff", "#4df1ffa8"],
        bubbleClassNames: [
          "md:top-[40vh] md:left-[10vw]",
          "top-[20vh] left-[27vw] md:top-[60vh] md:left-[10vw]",
        ],
      }}
      // classNameWrapper={clsx(
      //   "md:mt-0 md:flex md:right-0 md:top-0 md:w-1/2 md:h-full md:overflow-y-auto md:z-[100]",
      //   "relative ml-auto",
      // )}
      navigationItems={<ProfileHomeMenu className="md:hidden" />}
    >
      <main
        className={clsx(
          "container flex flex-col flex-1 relative max-w-6xl w-full",
          "sm:mt-0",
          "md:px-20 md:ml-auto md:w-2/3",
        )}
      >
        <div className={clsx("px-5 md:px-16", "md:bg-white")}>
          <div className="flex items-center justify-between">
            <div>
              <H3 className="block py-2">
                {account?.name ? account.name : account?.anchor}
              </H3>
              <P className={clsx("text-xs")}>NFID number: {account?.anchor}</P>
            </div>

            <ProfileHomeMenu className="hidden md:block" />
          </div>
        </div>
        {hasPoa && (
          <Link
            to={generatePath(
              `${AppScreenProofOfAttendencyConstants.base}/${AppScreenProofOfAttendencyConstants.award}`,
              { secret: "iiw-april-22" },
            )}
            className={clsx("overflow-hidden", "sm:px-3 sm:pb-6 sm:bg-white")}
          >
            <PoaBanner />
          </Link>
        )}
        <div className={clsx("px-5 md:px-16 pt-5", "bg-white overflow-hidden")}>
          <List>
            <List.Header>
              <div className="mb-3">
                <H5>Applications</H5>
              </div>
            </List.Header>
            <List.Items className="ml-0">
              {myApplications.length > 0 ? (
                myApplications.map((application, index) => (
                  <ListItem
                    key={index}
                    title={application.applicationName}
                    subtitle={`${application.iiPersonasCount} persona${
                      application.iiPersonasCount > 1 ? "s" : ""
                    }`}
                    icon={
                      <span className="text-xl font-medium text-blue-base">
                        {application.applicationName[0]}
                      </span>
                    }
                    defaultAction={false}
                    onClick={() =>
                      // handleNavigateToApplication(application.applicationName)
                      console.log(">> onClick ", { application })
                    }
                  />
                ))
              ) : (
                <div>
                  <div>
                    Applications you’ve created accounts with will be listed
                    here.
                  </div>

                  <div>
                    <div className="relative">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <ListItemPlaceholder key={index} index={index} />
                      ))}

                      <div className="absolute left-0 w-full h-full top-8 bg-gradient-to-t from-white to-white/5" />
                    </div>
                  </div>
                </div>
              )}
            </List.Items>
          </List>
        </div>
        <div className={clsx("px-5 md:px-16 pt-4", "bg-white flex-1")}>
          <List>
            <List.Header>
              <div className="flex items-center justify-between mb-3">
                <H5>Devices</H5>

                <div className="hidden">
                  <PlusIcon className="text-blue-base mr-[14px]" />
                </div>
              </div>
            </List.Header>
            <List.Items className="ml-0">
              {devices.map((device, index) => (
                <DeviceListItem
                  key={device.alias}
                  device={device}
                  onChangeIcon={async (device) =>
                    console.log(">> onChangeIcon", { device })
                  }
                  onChangeLabel={async (device) =>
                    console.log(">> onChangeLabel", { device })
                  }
                  onDelete={onDeleteDeviceFactory(device.pubkey)}
                />
              ))}
            </List.Items>
          </List>
        </div>
      </main>
    </AppScreen>
  )
}
