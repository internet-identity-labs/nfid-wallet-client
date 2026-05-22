import React, { useState } from "react"

interface StepInputProps {
  onSubmit: (token: string) => Promise<void>
  buttonText?: string
  responseError?: string
  resetResponseError?: () => void
}

export const StepInput: React.FC<StepInputProps> = ({
  onSubmit,
  buttonText = "Submit",
  responseError,
  resetResponseError,
}) => {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    resetResponseError?.()
    onSubmit(value)
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        className="border rounded px-3 py-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter code"
      />
      {responseError && <p className="text-red-500 text-sm">{responseError}</p>}
      <button
        className="px-6 py-2 bg-blue text-white rounded"
        onClick={handleSubmit}
      >
        {buttonText}
      </button>
    </div>
  )
}
