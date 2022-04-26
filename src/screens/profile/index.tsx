import {
  P,
  List,
  H5,
  ListItem,
  PlusIcon,
  ModalAdvancedProps,
  H3,
} from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { ListItemPlaceholder } from "frontend/design-system/molecules/placeholders/list-item"
import { PoaBanner } from "frontend/design-system/molecules/poa-banner"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
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
      classNameWrapper="relative mt-32 md:mt-0 md:absolute md:flex md:right-0 md:top-0 md:w-1/2 md:h-full md:overflow-y-auto bg-white md:z-[100]"
      navigationItems={<ProfileHomeMenu className="md:hidden" />}
    >
      <div className="relative grid grid-cols-12 -mt-32 sm:mt-0 md:px-6">
        <div className="w-full max-w-6xl col-span-12 mx-auto">
          <div className="col-span-12 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <H3 className="block py-2">
                  {account?.name ? account.name : account?.anchor}
                </H3>
                <P>NFID number: {account?.anchor}</P>
              </div>

              <ProfileHomeMenu className="hidden md:block" />
            </div>
          </div>
          {hasPoa && (
            <div className="mb-6 overflow-hidden rounded-lg">
              <PoaBanner />
            </div>
          )}
          <div className="col-span-12 mb-8">
            <List>
              <List.Header>
                <div className="mb-3">
                  <H5>Applications</H5>
                </div>
              </List.Header>
              <List.Items>
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

                        <div className="absolute left-0 w-full h-full top-8 bg-gradient-to-t from-white to-white/5"></div>
                      </div>
                    </div>
                  </div>
                )}
              </List.Items>
            </List>
          </div>
          <div className="col-span-12">
            <List>
              <List.Header>
                <div className="flex items-center justify-between mb-3">
                  <H5>Devices</H5>

                  <div className="hidden">
                    <PlusIcon className="text-blue-base mr-[14px]" />
                  </div>
                </div>
              </List.Header>
              <List.Items>
                {devices.map((device, index) => (
                  <DeviceListItem
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
        </div>
      </div>
    </AppScreen>
  )
}
