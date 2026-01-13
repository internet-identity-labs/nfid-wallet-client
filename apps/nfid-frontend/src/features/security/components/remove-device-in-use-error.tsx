import { Button } from "@nfid/ui"
import { ModalComponent } from "@nfid/ui/molecules/modal"

export interface RemoveDeviceInUseErrorProps {
  isModalVisible: boolean
  setIsModalVisible: (value: boolean) => void
}

export const RemoveDeviceInUseError = ({
  isModalVisible,
  setIsModalVisible,
}: RemoveDeviceInUseErrorProps) => {
  return (
    <ModalComponent
      isVisible={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      className="p-5 w-[95%] md:w-[540px] z-[100] lg:rounded-xl"
    >
      <div className="space-y-3.5">
        <p className="text-2xl font-bold">Cannot remove current device</p>
        <p className="text-sm leading-5">
          The device you are trying to remove is the one you’re currently signed
          in with.
        </p>
        <p className="text-sm leading-5">
          Sign out and sign back in with a different device to remove this one.
        </p>
        <div className={"grid p-1.5 !flex justify-end"}>
          <Button
            className={"!py-2.5 !px-16"}
            onClick={() => setIsModalVisible(false)}
          >
            Ok
          </Button>
        </div>
      </div>
    </ModalComponent>
  )
}
