import React from "react"
import clsx from "clsx"

interface InputSelectProps
  extends React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  > {
  id: string
  name: string
  options: Array<{
    value: string
    selected: boolean
    label: string
  }>
}

// TODO: make dynamic
export const InputSelect: React.FC<InputSelectProps> = ({
  id,
  name,
  options,
  onChange,
  ...props
}) => {
  return (
    <select name={name} id={id} onChange={onChange} {...props}>
      {options.map(({ value, label, selected }) => (
        <option value={value} selected={selected}>
          {label}
        </option>
      ))}
    </select>
  )
}
