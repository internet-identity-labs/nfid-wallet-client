import { H5, IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"

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
  title,
}) => (
  <>
    <div className="flex flex-col items-center w-full pt-8">
      <img src={IconSvgNFIDWalletLogo} className="h-[43px]" />

      {title && (
        <H5 className="mt-3 !text-base leading-6 text-black">{title}</H5>
      )}

      {applicationURL && (
        <div className="flex items-center mt-2 space-x-1 text-sm">
          <span>
            {subTitle}{" "}
            <a
              className="transition-opacity text-primaryButtonColor hover:opacity-50"
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
