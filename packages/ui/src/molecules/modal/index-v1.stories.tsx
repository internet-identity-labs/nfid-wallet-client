import { Meta, StoryFn, StoryObj } from "@storybook/react"
import React, { FunctionComponent } from "react"

import { Button } from "../button"
import { ModalAdvanced, ModalAdvancedProps } from "./advanced"
import { Modal, ModalProps } from "./index-v1"

const meta: Meta = {
  title: "Molecules/Modal",
  component: Modal,
  //subcomponents: { ModalAdvanced },
  subcomponents: { ModalAdvanced: ModalAdvanced as FunctionComponent<unknown> },
  argTypes: {
    children: {
      control: {
        type: "text",
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<ModalProps> = ({ isVisible, ...args }) => {
  const [visible, setVisible] = React.useState(isVisible)
  return (
    <>
      <Button onClick={() => setVisible(true)}>Open Modal</Button>
      <Modal {...args} isVisible={visible} onClose={() => setVisible(false)} />
    </>
  )
}

const AdvancedModal: StoryFn<ModalAdvancedProps> = ({ ...args }) => {
  const [visible, setVisible] = React.useState(false)

  const toggleVisibility = React.useCallback(
    () => setVisible((prev) => !prev),
    [setVisible],
  )

  return (
    <>
      <Button text onClick={() => setVisible(true)}>
        Open Advanced Modal
      </Button>

      {visible && (
        <ModalAdvanced
          {...args}
          title={"Delete access point"}
          onClose={toggleVisibility}
          children={
            <div>
              Do you really want to delete access point? This process cannot be
              undone.
            </div>
          }
          primaryButton={{
            type: "red",
            text: "Delete",
            onClick: toggleVisibility,
          }}
          secondaryButton={{
            type: "secondary",
            text: "Cancel",
            onClick: toggleVisibility,
          }}
        />
      )}
    </>
  )
}

export const Default: StoryObj<ModalProps> = {
  render: Template,

  args: {
    children: "Button",
    onClose: () => {},
    id: "default-modal",
  },
}

export const Advanced: StoryObj<ModalAdvancedProps> = {
  render: AdvancedModal,

  args: {
    id: "advanced-modal",
    title: "Delete access point",
    large: false,
  },
}
