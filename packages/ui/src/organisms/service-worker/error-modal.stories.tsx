import type { Meta } from "@storybook/react"

import { ErrorModal } from "./error-modal"

const Story: Meta<typeof ErrorModal> = {
  component: ErrorModal,
  title: "Organisms/ServiceWorkerErrorModal",
}
export default Story

export const Primary = {
  args: {
    errorMessages: [
      { url: "https://whatever.com/data", message: "failed to fetch" },
    ],
  },
}
