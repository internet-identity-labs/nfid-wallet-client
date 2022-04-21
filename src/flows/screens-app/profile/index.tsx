import {
  ButtonMenu,
  DotsIcon,
  H3,
  H5,
  List,
  ListItem,
  Loader,
  ModalAdvanced,
  ModalAdvancedProps,
  P,
  PlusIcon,
} from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { MdLaptopMac } from "react-icons/md"

import { ListItemPlaceholder } from "frontend/design-system/molecules/placeholders/list-item"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { Device } from "frontend/services/identity-manager/devices/state"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { IIPersona } from "frontend/services/identity-manager/persona/types"
import { getUrl } from "frontend/utils"

import { ProfileHomeMenu } from "./profile-home-menu"

interface AuthenticateNFIDHomeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthenticateNFIDHome: React.FC<AuthenticateNFIDHomeProps> = ({
  children,
  className,
}) => {
  const { iiPersonas } = usePersona()

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

  const [showModal, setShowModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [modalOptions, setModalOptions] =
    React.useState<ModalAdvancedProps | null>(null)

  const { devices, deleteDevice, handleLoadDevices } = useDevices()
  const { account } = useAccount()

  const handleDeleteDevice = React.useCallback(
    (publicKey) => async () => {
      setLoading(true)

      await deleteDevice(publicKey)
      await handleLoadDevices()

      setLoading(false)
      setShowModal(false)
    },
    [deleteDevice, handleLoadDevices],
  )

  const handleDeleteDeviceDialog = React.useCallback(
    (
      e: React.MouseEvent<HTMLLIElement, MouseEvent>,
      toggle,
      device: Device,
    ) => {
      e.stopPropagation()
      toggle()
      setShowModal(true)

      setModalOptions({
        title: "Delete access point",
        children: (
          <P>
            Do you really want to delete{" "}
            <span className="font-bold">{device.alias}</span> access point? This
            process cannot be undone.
          </P>
        ),
        primaryButton: {
          text: "Delete",
          type: "error",
          onClick: handleDeleteDevice(device.pubkey),
        },
        secondaryButton: {
          text: "Cancel",
          type: "secondary",
          onClick: () => {
            setShowModal(false)
          },
        },
      })
    },
    [handleDeleteDevice],
  )

  const handleNavigateToApplication = React.useCallback(
    (applicationName: string) => {
      const application = iiPersonas.find((iiPersona) => {
        return iiPersona.domain.includes(applicationName.toLowerCase())
      })

      if (application) {
        window.open(application.domain, "_blank")
      }
    },
    [iiPersonas],
  )

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
          <div className="col-span-12 mb-16 md:mb-12">
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
                        handleNavigateToApplication(application.applicationName)
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
                  <ListItem
                    key={device.alias}
                    title={device.alias}
                    subtitle={""}
                    icon={<MdLaptopMac className="text-xl text-blue-base" />}
                    action={
                      <ButtonMenu buttonElement={<DotsIcon />}>
                        {(toggle) => (
                          <>
                            <li
                              className="hover:bg-gray-200 text-red-base"
                              onClick={(e) =>
                                handleDeleteDeviceDialog(e, toggle, device)
                              }
                            >
                              <div className="block px-4 py-2 text-sm">
                                Delete
                              </div>
                            </li>
                          </>
                        )}
                      </ButtonMenu>
                    }
                  />
                ))}
              </List.Items>
            </List>
          </div>
        </div>

        {showModal && modalOptions && (
          <ModalAdvanced
            title={modalOptions.title}
            onClose={() => setShowModal(false)}
            primaryButton={modalOptions.primaryButton}
            secondaryButton={modalOptions.secondaryButton}
          >
            {modalOptions.children}
            <Loader isLoading={loading} />
          </ModalAdvanced>
        )}
      </div>
    </AppScreen>
  )
}
