import { DotsIcon } from "components/atoms/button/icons/dots"
import { LogoutIcon } from "components/atoms/button/icons/logout"
import { PlusIcon } from "components/atoms/button/icons/plus"
import { ButtonMenu } from "components/atoms/button/menu"
import {
  ModalAdvanced,
  ModalAdvancedProps,
} from "components/molecules/modal/advanced"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import {
  Button,
  Card,
  CardBody,
  H2,
  H5,
  Input,
  List,
  ListItem,
  Loader,
  P,
} from "frontend/ui-kit/src"
import React from "react"
import { MdLaptopMac } from "react-icons/md"

interface AuthenticateNFIDHomeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthenticateNFIDHome: React.FC<AuthenticateNFIDHomeProps> = ({
  children,
  className,
}) => {
  const applications = ["Example app", "DSCVR", "OpenChat"]

  const [showModal, setShowModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [modalOptions, setModalOptions] =
    React.useState<ModalAdvancedProps | null>(null)

  const { devices, deleteDevice, handleLoadDevices } = useDevices()
  console.log(">> ", { devices })
  const { account } = useAccount()

  const handleDeleteDevice = React.useCallback(
    (publicKey) => async () => {
      setLoading(true)

      const response = await deleteDevice(publicKey)
      console.log(">> handleDeleteDevice", { response })
      handleLoadDevices()

      setLoading(false)
      setShowModal(false)
    },
    [deleteDevice, handleLoadDevices],
  )

  return (
    <AppScreen
      navigationItems={
        <Button text icon>
          <LogoutIcon />
          <span className="hidden md:block">Logout</span>
        </Button>
      }
    >
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12">
          <div>
            <H2 className="py-2">{account?.name}</H2>
            <P className="">NFID Number: {account?.anchor}</P>
          </div>

          <div className="grid grid-cols-12 gap-4 py-6 md:py-14">
            <div className="col-span-12 md:col-span-6">
              <List>
                <List.Header>
                  <div className="mb-5">
                    <H5>Applications</H5>
                  </div>
                </List.Header>
                <List.Items>
                  {applications.map((application, index) => (
                    <ListItem
                      key={index}
                      title={application}
                      icon={
                        <span className="text-xl font-medium text-blue-base">
                          {application[0]}
                        </span>
                      }
                    />
                  ))}
                </List.Items>
              </List>
            </div>
            <div className="col-span-12 md:col-span-6">
              <List>
                <List.Header>
                  <div className="flex items-center justify-between mb-5">
                    <H5>Access points</H5>

                    <div>
                      <PlusIcon className="text-blue-base mr-[14px]" />
                    </div>
                  </div>
                </List.Header>
                <List.Items>
                  {devices.map((device, index) => (
                    <ListItem
                      key={device.alias}
                      title={device.alias}
                      subtitle={"Mozilla Firefox 78.0.2 – 12.08.2021"}
                      icon={<MdLaptopMac className="text-xl text-blue-base" />}
                      action={
                        <ButtonMenu buttonElement={<DotsIcon />}>
                          {(toggle) => (
                            <>
                              <li
                                className="hover:bg-gray-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggle()
                                  setShowModal(true)

                                  setModalOptions({
                                    title: "Rename access point",
                                    children: (
                                      <>
                                        <Input
                                          autoFocus
                                          labelText="Access point name"
                                          defaultValue={"MacBook Pro"}
                                        />
                                      </>
                                    ),
                                    primaryButton: {
                                      text: "Rename",
                                      type: "primary",
                                      onClick: () => {
                                        console.log("rename")
                                        setShowModal(false)
                                      },
                                    },
                                    secondaryButton: {
                                      text: "Cancel",
                                      onClick: () => {
                                        console.log("cancel")
                                        setShowModal(false)
                                      },
                                    },
                                  })
                                }}
                              >
                                <a className="block px-4 py-2 text-sm">
                                  Rename
                                </a>
                              </li>
                              <li
                                className="hover:bg-gray-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggle()
                                  setShowModal(true)

                                  setModalOptions({
                                    title: "Delete access point",
                                    children: (
                                      <P>
                                        Do you really want to delete{" "}
                                        <span className="font-bold">
                                          {device.alias}
                                        </span>{" "}
                                        access point? This process cannot be
                                        undone.
                                      </P>
                                    ),
                                    primaryButton: {
                                      text: "Delete",
                                      type: "error",
                                      onClick: handleDeleteDevice(
                                        device.pubkey,
                                      ),
                                    },
                                    secondaryButton: {
                                      text: "Cancel",
                                      onClick: () => {
                                        console.log("cancel")
                                        setShowModal(false)
                                      },
                                    },
                                  })
                                }}
                              >
                                <a className="block px-4 py-2 text-sm">
                                  Delete
                                </a>
                              </li>
                            </>
                          )}
                        </ButtonMenu>
                      }
                    />
                    // {/*
                    //   AVAILABLE ICONS:
                    //     MdLaptopChromebook - MdLaptopMac - MdLaptopWindows -
                    //     MdPhoneAndroid - MdPhoneIphone -
                    //     MdDesktopMac - MdDesktopWindows
                    //   */}
                  ))}
                </List.Items>
              </List>
            </div>
          </div>
        </CardBody>

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
      </Card>
    </AppScreen>
  )
}
