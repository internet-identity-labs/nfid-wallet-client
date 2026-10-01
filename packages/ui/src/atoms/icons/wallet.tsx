import React from "react"

interface IconWalletProps extends React.HTMLAttributes<HTMLDivElement> {}

export const IconWallet: React.FC<IconWalletProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16.9331 5.21671C16.0189 5.24267 15.5618 5.25565 15.0954 5.1146C15.0644 5.10524 15.0296 5.09406 14.999 5.08366C14.5375 4.92694 14.1565 4.63757 13.3943 4.05882C12.7212 3.54769 12.3847 3.29212 11.9938 3.15346C11.9667 3.14385 11.9395 3.13468 11.9121 3.12595C11.517 3 11.0944 3 10.2492 3H9.5C5.96447 3 4.1967 3 3.09835 4.12973C2 5.25946 2 7.07774 2 10.7143V13.2857C2 16.9223 2 18.7405 3.09835 19.8703C4.1967 21 5.96447 21 9.5 21H14.5C18.0355 21 19.8033 21 20.9017 19.8703C22 18.7405 22 16.9223 22 13.2857V9.75C22 8.25 22 7.12973 20.9017 6C20.0366 5.1102 19.0434 5.15679 16.9331 5.21671Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M6 7H11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 16H17C16.0572 16 15.5858 16 15.2929 15.7071C15 15.4142 15 14.9428 15 14C15 13.0572 15 12.5858 15.2929 12.2929C15.5858 12 16.0572 12 17 12H22V14C22 14.9428 22 15.4142 21.7071 15.7071C21.4142 16 20.9428 16 20 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}
