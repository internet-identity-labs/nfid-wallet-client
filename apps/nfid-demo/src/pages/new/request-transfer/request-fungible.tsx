import { Button, Input } from "@nfid-frontend/ui"

export const RequestFungibleTransfer = () => {
  return (
    <div className="space-y-4">
      <Input
        id="inputICAddressFT"
        labelText="Receiver IC address"
        placeholder="39206df1ca32d2..."
        // value={receiver}
        // onChange={(e) => setReceiver(e.target.value)}
      />
      <Input
        id="inputAmount"
        labelText="Amount ICP"
        placeholder="0.0001"
        // errorText={errors.amount?.message}
        // {...register("amount")}
      />
      <Button
        id="buttonRequestICP"
        //   onClick={handleSubmit(onRequestTransfer)}
      >
        Request ICP transfer
      </Button>
    </div>
  )
}
