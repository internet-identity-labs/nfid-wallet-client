import clsx from "clsx"

import { Button } from "@nfid-frontend/ui"

import { ProfileTemplate } from "@nfid-frontend/ui"

import ImageVaultUpgrade from "./vault-upgrade.png"

export const VaultUpgradeScreen = () => {
  const css = `
    #root {
        background: linear-gradient(114deg, #001f30 0%, #025b6a 100%);
    }

    #mobile-menu {
        color: white;
    }

    .mobile-menu-active svg {
        color: black!important;
    }

    @media screen and (min-width: 641px) {
        .sidebar-item span {
            color: #cffafe !important;
        }

        .sidebar-item div {
            background: #cffafe !important;
        }

        .sidebar-item-active {
            background: rgba(22, 78, 99, 0.40);
        }

        .sidebar-item:hover, .sidebar-item-active:hover {
            background: rgba(22, 78, 99, 0.40);
        }

        .sidebar-item-active div {
            background: #0E62FF
        }
    }

    .logo {
        color: white;
    }

    .vault-upgrade-text {
        background: linear-gradient(90deg, #00BECA -5.65%, #5BFCFC 99.96%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
`

  return (
    <ProfileTemplate>
      <>
        <style>{css}</style>
        <div
          className={clsx(
            "flex-col-reverse sm:flex-row flex items-center justify-center",
            "sm:h-2/3 sm:pr-[10%] w-full",
            "text-center sm:text-left",
          )}
        >
          <div className="text-white">
            <p className="font-inter text-[28px] sm:text-[32px] font-medium">
              NFID Vaults is{" "}
              <span className="font-bold vault-upgrade-text">growing up</span>
            </p>
            <p className="text-cyan-100 w-full sm:w-[450px] text-sm leading-5 mt-5 sm:mt-7">
              The Vaults you know and love are now available as a separate dapp
              specifically designed to streamline team asset management.
              <br />
              <br /> Just connect your NFID Wallet to pick up where you left
              off.
            </p>
            <Button
              isSmall
              className={clsx(
                "mt-[30px] !text-white !border-white w-[200px]",
                "hover:!bg-white hover:!text-black hover:!border-white",
                "focus:!bg-white focus:!text-black focus:!border-white",
              )}
              type="stroke"
              onClick={() =>
                window.open("https://app.nfidvaults.com", "_blank")
              }
            >
              Continue to NFID Vaults
            </Button>
          </div>
          <img
            src={ImageVaultUpgrade}
            className={clsx("w-full sm:w-2/5 sm:-ml-5 sm:mt-24")}
          />
        </div>
      </>
    </ProfileTemplate>
  )
}
