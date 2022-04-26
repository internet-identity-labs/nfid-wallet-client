import React from 'react';

interface MapPinIconProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  strokeColor?: string;
  size?: string | number;
}

export const MapPinIcon: React.FC<MapPinIconProps> = ({
  onClick,
  strokeColor = 'black',
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path
        d="M18 9.95455C18 15.3636 11.5 20 11.5 20C11.5 20 5 15.3636 5 9.95455C5 8.11009 5.68482 6.34117 6.90381 5.03694C8.12279 3.73271 9.77609 3 11.5 3C13.2239 3 14.8772 3.73271 16.0962 5.03694C17.3152 6.34117 18 8.11009 18 9.95455Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 12C12.8807 12 14 10.8807 14 9.5C14 8.11929 12.8807 7 11.5 7C10.1193 7 9 8.11929 9 9.5C9 10.8807 10.1193 12 11.5 12Z"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
