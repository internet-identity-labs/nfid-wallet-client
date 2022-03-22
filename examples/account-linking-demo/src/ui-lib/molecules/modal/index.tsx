import clsx from "clsx"
import React from "react"
import ReactDOM from "react-dom"

export const Header: React.FC = ({ children }) => <div>{children}</div>

const useModalRoot = (id: string) => {
  const modalRoot = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    modalRoot.current = document.createElement("div")
    modalRoot.current.id = `modal-root-${id}`
    document.body.appendChild(modalRoot.current)
    return () => {
      modalRoot.current && document.body.removeChild(modalRoot.current)
    }
  }, [id])
  return modalRoot
}

interface ModalProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onClose: () => void
  onModalMounted?: () => void
  id: string
  isVisible?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  id,
  children,
  className,
  isVisible,
  onClose,
  onModalMounted,
}) => {
  const [visible, setVisible] = React.useState(false)
  const modalRoot = useModalRoot(id)

  React.useEffect(() => {
    const val = setTimeout(() => setVisible(!!isVisible))
    return () => clearTimeout(val)
  }, [isVisible])

  React.useEffect(() => {
    const timeout = setTimeout(() => onModalMounted && onModalMounted())
    return () => clearTimeout(timeout)
  }, [onModalMounted])

  const escFunction = React.useCallback(
    (event) => {
      if (event.keyCode === 27) {
        onClose()
      }
    },
    [onClose],
  )

  React.useEffect(() => {
    document.addEventListener("keydown", escFunction, false)

    return () => {
      document.removeEventListener("keydown", escFunction, false)
    }
  })

  return modalRoot?.current
    ? ReactDOM.createPortal(
        <div
          onClick={() => {
            onClose()
          }}
          className={clsx([
            "animate-fast-fade-in",
            "z-50 top-0 right-0 bottom-0 left-0",
            visible
              ? "w-full h-full fixed bg-opacity-75 bg-gray-200"
              : "bg-transparent",
          ])}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={clsx([
              "transiton duration-300",
              "fixed top-[50%] right-[50%] bottom-[50%] left-[50%]",
              "transform -translate-x-2/4 -translate-y-2/4",
              "md:rounded-md",
              "w-full md:w-max md:max-w-[90%] h-full md:h-[90%] md:max-h-[1000px]",
              "shadow-2xl",
              "overflow-hidden",
              !visible && "bg-transparent",
              className,
            ])}
          >
            {visible ? <div className="h-full bg-white">{children}</div> : null}
          </div>
        </div>,
        modalRoot.current,
      )
    : null
}
