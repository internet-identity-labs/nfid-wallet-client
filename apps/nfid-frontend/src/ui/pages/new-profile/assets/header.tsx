import { BlurredLoader, Button, Input, Loader, Warning, sumRules } from "@nfid-frontend/ui"
import { ChangeEvent, useEffect, useState } from "react"
import clsx from "clsx"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { UnknownIcon } from "packages/ui/src/atoms/icons/unknown"
import { isNotEmpty, isValidPrincipalId, validateTransferAmountField, CANISTER_ID_LENGTH } from "frontend/features/transfer-modal/utils/validations"
import { register } from "frontend/integration/internet-identity"
import { useForm } from "react-hook-form"
import { ICRC1Data, addICRC1Canister, isICRC1Canister } from 'packages/integration/src/lib/token/icrc1'
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"

interface IProfileAssetsHeader {
  setIsNewTokenAdded: (value: boolean) => void
}

export const ProfileAssetsHeader: React.FC<IProfileAssetsHeader> = ({ setIsNewTokenAdded }) => {
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ tokenInfo, setTokenInfo ] = useState<ICRC1Data | null>(null);
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

  useEffect(() => {
    if (errors.ledgerID) {
      resetField('indexID');
      setTokenInfo(null)
    }
  }, [errors.ledgerID, resetField]);

  console.log('errrrr', Object.values(errors).some(error => error))
  

  const submit = async (values: { ledgerID: string; indexID: string }) => {
    const { ledgerID, indexID } = values;

    try {
      setIsLoading(true);
      await addICRC1Canister(ledgerID, indexID);
      setIsModalVisible(false);
      setIsNewTokenAdded(true);
    } catch (e) {
      console.debug(e);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchICRCToken = async () => {
    try {
      const { rootPrincipalId, publicKey } = await getLambdaCredentials();
      const data = await isICRC1Canister(getValues('ledgerID'), rootPrincipalId!, publicKey, getValues('indexID'));
      setTokenInfo(data);
      return true;
    } catch (e) {
      console.debug(e);
      switch ((e as Error).message) {
        case "Ledger canister does not match index canister.":
          return Promise.resolve((e as Error).message);
        case "Canister already added.":
          return Promise.resolve((e as Error).message);
        default:
          return Promise.resolve("This does not appear to be an ICRC-1 compatible canister");
      }
    }
  }


  // const validateInput = (value: string) => {
  //   if (value === tokenInfo?.canisterId) return true;
  //   setTokenInfo(null);
  //   if (isValidPrincipalId(value) !== true) return Promise.resolve("This does not appear to be an ICRC-1 compatible canister")

  //   if (value.length !== CANISTER_ID_LENGTH) {
  //     setTokenInfo(null);
  //     return false;
  //   }
  // }

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
        onClose={() => {
          setIsModalVisible(false);
          resetField('ledgerID');
          resetField('indexID');
          setTokenInfo(null);
          setIsLoading(false);
        }}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl"
      >
        <div className="space-y-3.5">
          <p className="text-2xl font-bold">Import token</p>
          <Input
            id="ledgerID"
            labelText="Ledger canister ID"
            errorText={isLoading ? undefined : errors.ledgerID?.message}
            {...register("ledgerID", {
              minLength: {
                value: CANISTER_ID_LENGTH,
                message: `Canister ID must be ${CANISTER_ID_LENGTH} characters long`,
              },
              maxLength: {
                value: CANISTER_ID_LENGTH,
                message: `Canister ID must be ${CANISTER_ID_LENGTH} characters long`,
              },
              validate: fetchICRCToken,
            })}
          />
          <Input
            id="indexID"
            labelText="Index canister ID (optional)"
            errorText={isLoading ? undefined : errors.indexID?.message}
            {...register("indexID", {
              minLength: {
                value: CANISTER_ID_LENGTH,
                message: `Canister ID must be ${CANISTER_ID_LENGTH} characters long`,
              },
              maxLength: {
                value: CANISTER_ID_LENGTH,
                message: `Canister ID must be ${CANISTER_ID_LENGTH} characters long`,
              },
              validate: fetchICRCToken,
            })}
            disabled={!!errors.ledgerID || !getValues('ledgerID').length}
          />
          <BlurredLoader
            isLoading={isLoading}
            className="flex flex-col flex-1"
            overlayClassnames="rounded-xl"
            id="import"
          >
            <div className="min-h-[172px] text-sm flex">
              {tokenInfo && (
                <div className="bg-gray-50 rounded-[6px] p-4 text-gray-500 w-full">
                  <div className="grid grid-cols-[110px,1fr] gap-3">
                    <p>Token icon</p>
                    {tokenInfo.logo ? <img className="rounded-full" src={tokenInfo.logo} alt="Token logo" width={36} /> : <UnknownIcon />}
                  </div>
                  <div className="grid grid-cols-[110px,1fr] gap-3 my-4">
                    <p>Token symbol</p>
                    <p className="text-black">{tokenInfo.symbol}</p>
                  </div>
                  <div className="grid grid-cols-[110px,1fr] gap-3">
                    <p>Token name</p>
                    <p className="text-black">{tokenInfo.name}</p>
                  </div>
                </div>
              )}
            </div>
          </BlurredLoader>
          <Warning
            title="Token safety"
            text="contains a list of known ICRC-1 canisters. Import others with caution."
            link={{text: "NFID’s Knowledge Base", url: "https://learn.nfid.one/"}}
          />
          <Button
            className="text-base"
            id="importToken"
            icon={<PlusIcon />}
            block
            type="primary"
            onClick={handleSubmit(submit)}
            disabled={Boolean(!tokenInfo) || Object.values(errors).some(error => error)}
          >
            Import custom token
          </Button>
        </div>
      </ModalComponent>
    </>
  )
}
