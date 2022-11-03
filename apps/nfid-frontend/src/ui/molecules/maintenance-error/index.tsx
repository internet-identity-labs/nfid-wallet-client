import clsx from "clsx"

export const MaintenanceError = ({ isDown }: { isDown: boolean }) => {
  return (
    <div
      className={clsx(
        "text-xs text-white h-12 w-full",
        "bg-red-500 text-center font-inter",
        "flex items-center justify-center",
      )}
    >
      <p>
        {!isDown ? (
          <>
            Please note NFID will be unavailable during scheduled <br />
            maintenance for some hours on October 26.{" "}
          </>
        ) : (
          <>NFID is undergoing scheduled maintenance. </>
        )}
        <a
          className="transition-opacity border-b hover:opacity-80"
          href="https://forum.dfinity.org/t/internet-identity-subnet-migration-on-october-26/15989"
          target="_blank"
          rel="noreferrer"
        >
          More details
        </a>
      </p>
    </div>
  )
}
