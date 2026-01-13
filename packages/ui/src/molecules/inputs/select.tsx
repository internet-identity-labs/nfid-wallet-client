import React from "react"

interface InputSelectProps extends React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> {
  name: string
  options: Array<{
    value: string
    label: string
  }>
}

export const InputSelect = React.forwardRef<
  HTMLSelectElement,
  InputSelectProps
>(({ name, options, onChange, ...props }, ref) => {
  return (
    <select ref={ref} name={name} onChange={onChange} {...props}>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
})
