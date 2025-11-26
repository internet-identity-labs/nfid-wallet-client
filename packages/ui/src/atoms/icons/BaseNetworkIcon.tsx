type BaseNetworkIconProps = {
  color?: string
}

export const BaseNetworkIcon: React.FC<BaseNetworkIconProps> = ({
  color = "white",
}) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.99161 14.526C12.0482 14.526 14.526 12.0524 14.526 9.00128C14.526 5.95007 12.0482 3.47656 8.99161 3.47656C6.09179 3.47656 3.71283 5.70298 3.47656 8.53687H10.7917V9.46565H3.47656C3.71283 12.2995 6.09179 14.526 8.99161 14.526Z"
        fill={color}
      />
    </svg>
  )
}
