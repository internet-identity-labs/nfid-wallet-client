import { BlurredLoader, Button, Input, Loader, sumRules } from "@nfid-frontend/ui"
import { useState } from "react"
import clsx from "clsx"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { isNotEmpty, validateTransferAmountField } from "frontend/features/transfer-modal/utils/validations"
import { register } from "frontend/integration/internet-identity"
import { useForm } from "react-hook-form"
import { ICRC1Data, addICRC1Canister, getICRC1Data } from '../../../../../../../packages/integration/src/lib/icrc1'
import { Chain, getGlobalKeys, getPublicKey } from "packages/integration/src/lib/lambda/ecdsa"
import { RootWallet, accessList, authState, iCRC1Registry, im, replaceActorIdentity } from "@nfid/integration"
import { toHexString } from "@dfinity/candid"
import { Ed25519KeyIdentity } from "@dfinity/identity"
//import { toHexString } from "@dfinity/candid/lib/cjs/utils/buffer"


export const ProfileAssetsHeader = () => {
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ tokenInfo, setTokenInfo ] = useState<Array<ICRC1Data>>([]);
  const [ importError, setImportError ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);

  const handleOpenImportToken = () => {
    setIsModalVisible(true)
  }

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    setError,
    resetField,
    getValues,
  } = useForm({
    mode: "all",
    defaultValues: {
      ledgerID: "",
      indexID: "",
    },
  })

  const submit = async (values: { ledgerID: string; }) => {
    const account = await im.get_account()
    const root = account.data[0]?.principal_id

    try {
      setIsLoading(true);
      await addICRC1Canister(values.ledgerID);
    } catch (e) {
      console.debug(e);
      setImportError(true);
    } finally {
      setIsLoading(false);
    }
    
    
    const key = await getPublicKey(authState.get().delegationIdentity!, Chain.IC)
    const principal = Ed25519KeyIdentity.fromParsedJson([
      key,
      "0",
    ]).getPrincipal();
    const data = await getICRC1Data(root!, principal.toText());
    console.log(data);
    
    setTokenInfo(data);
  }

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <p>Your tokens</p>
        <Button
          className={clsx("px-[10px] hidden md:flex z-10")}
          id="importToken"
          onClick={handleOpenImportToken}
          icon={<PlusIcon />}
          isSmall
          type="ghost"
        >
          Import token
        </Button>
      </div>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl"
      >
        <div className="space-y-3.5">
          <p className="text-2xl font-bold">Import token</p>
          <Input
            id="ledgerID"
            labelText="Ledger canister ID"
            placeholder="{Ledger canister ID}"
            //errorText={errors.memo?.message}
            {...register("ledgerID", {
              required: sumRules.errorMessages.required,
              validate: (value) => {
                return isNotEmpty(value)
              }
            })}
          />
          <Input
            id="indexID"
            labelText="Index canister ID (optional)"
            placeholder="{Index canister ID}"
            //errorText={errors.memo?.message}
            {...register("indexID", {
              //required: sumRules.errorMessages.required,
              // validate: (value) => {
              //   return isNotEmpty(value)
              // }
            })}
          />
          <div className="min-h-[172px]">
            {isLoading && (
              <Loader isLoading={true} />
            )}
            {importError && (
              <p>This does not appear to be an ICRC-1 compatible canister.</p>
            )}
            {tokenInfo.length && (
              <div>
                <div>
                  <p>Token icon</p>
                </div>
                <div>
                  <p>Token symbol</p>
                  <p></p>
                </div>
                
              </div>
            )}
          </div>
          <BlurredLoader
            isLoading={isLoading}
            className="flex flex-col flex-1"
            overlayClassnames="rounded-xl"
            id="import"
          >
            
          </BlurredLoader>
          <Button
            className="text-base"
            id="importToken"
            icon={<PlusIcon />}
            block
            type="primary"
            onClick={handleSubmit(submit)}
            disabled={Boolean(tokenInfo.length)}
          >
            Import custom token
          </Button>
        </div>
      </ModalComponent>
    </>
  )
}
