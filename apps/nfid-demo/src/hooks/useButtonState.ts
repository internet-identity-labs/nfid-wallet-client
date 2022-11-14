import React from "react"

export interface ButtonState {
  disabled: boolean
  loading: boolean
  label: string
}

export const useButtonState = ({
  disabled = false,
  loading = false,
  label = "Submit",
}: Partial<ButtonState> = {}) =>
  React.useReducer(
    (state: ButtonState, newState: Partial<ButtonState>): ButtonState => ({
      ...state,
      ...newState,
    }),
    {
      disabled,
      loading,
      label,
    },
  )
