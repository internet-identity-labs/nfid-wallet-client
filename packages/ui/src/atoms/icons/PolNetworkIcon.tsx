type PolNetworkIconProps = {
  color?: string
  size?: number
}

export const PolNetworkIcon: React.FC<PolNetworkIconProps> = ({
  color = "white",
  size = 18,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.2772 4.27734L8.32763 5.97138V11.2585L6.70018 12.2018L5.06278 11.2577V9.37007L6.70018 8.43508L7.75301 9.04564V7.51842L6.69098 6.91553L3.74219 8.62868V12.0174L6.70097 13.7214L9.64972 12.0174V6.73114L11.2872 5.78695L12.9237 6.73114V8.61031L11.2872 9.56287L10.2251 8.94695V10.4665L11.2772 11.0732L14.2551 9.37927V5.97138L11.2772 4.27734Z"
        fill={color}
      />
    </svg>
  )
}
