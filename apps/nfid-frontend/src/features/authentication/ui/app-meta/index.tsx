import { IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"

export interface AuthAppMetaProps {
  applicationLogo?: string
  applicationURL?: string
  applicationName?: string
  title?: string
  subTitle?: string | JSX.Element
}

export const AuthAppMeta: React.FC<AuthAppMetaProps> = ({
  applicationURL,
  subTitle = "Sign in to continue to",
}) => (
  <>
    <div className="flex flex-col items-center w-full pt-8">
      <img src={IconSvgNFIDWalletLogo} className="h-[43px]" />

      {/* <H5 className="mt-4 mb-2 text-sm leading-6 text-black">{title}</H5> */}

      {applicationURL && (
        <div className="flex items-center mt-5 space-x-1 text-sm">
          <span>
            {subTitle}{" "}
            <a
              className="transition-opacity text-linkColor hover:opacity-50"
              href={`https://${applicationURL}`}
              target="_blank"
              rel="noreferrer"
            >
              {applicationURL}
            </a>
          </span>
        </div>
      )}
    </div>
  </>
)
