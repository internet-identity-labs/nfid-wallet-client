import { IconCmpArrowGreen, IconCmpArrowRed } from "@nfid/ui/atoms/icons"
import { Button } from "@nfid/ui/molecules/button"
import { Input } from "../input"

export const CustomNetworkFee = () => {
  return (
    <div className="flex flex-col justify-between flex-1 h-full">
      <div className="mt-4 space-y-5">
        <Input
          labelText="Max base fee"
          innerText="GWEI"
          placeholder="80"
          helperText={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <b>Current:</b>
                <span>73.22 GWEI</span>
                <IconCmpArrowRed />
              </div>
              <div>
                <b>12hr: </b>66.14-161.24 GWEI
              </div>
            </div>
          }
        />
        <Input
          labelText="Priority fee"
          innerText="GWEI"
          placeholder="80"
          helperText={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <b>Current:</b>
                <span>0.11-15.45 GWEI</span>
                <IconCmpArrowGreen />
              </div>
              <div>
                <b>12hr: </b>0.05-94.05 GWEI
              </div>
            </div>
          }
        />
        <Input
          labelText="Gas limit"
          innerText="GWEI"
          placeholder="80"
          helperText={
            <div className="flex items-center space-x-1">
              <b>Suggested:</b> <span>21000 GWEI</span>
            </div>
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Button type="stroke">Cancel</Button>
        <Button type="primary">Save</Button>
      </div>
    </div>
  )
}
