import { H5, IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"

export interface AuthAppMetaProps {
  applicationURL?: string
  title?: string
  subTitle?: string | JSX.Element
}

export const AuthAppMeta: React.FC<AuthAppMetaProps> = ({
  applicationURL,
  subTitle = "Sign in to continue to",
  title,
}) => (
  <>
    <div className="flex flex-col items-center w-full pt-[30px]">
      <img src={IconSvgNFIDWalletLogo} className="h-[40px] mb-[14px]" />

      {title && <H5 className="!text-base leading-6 text-black">{title}</H5>}

      {applicationURL && (
        <div className="flex items-center space-x-1 text-sm">
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
