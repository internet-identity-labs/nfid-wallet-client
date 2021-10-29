import React from "react"
import { css } from "@emotion/css"

export const SampleFlowWithCss = () => {
  return (
    <div
      className={css`
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 1rem;
      `}
    >
      Sample Flow with css styling
    </div>
  )
}
