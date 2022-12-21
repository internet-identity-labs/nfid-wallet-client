import type { ComponentStory, ComponentMeta } from "@storybook/react"
import React from "react"

import { IconSvgDfinity } from "../../atoms/icons"
import { SelectTokenMenu } from "./select-token-menu"
import { TOKEN_OPTIONS } from "./select-token-menu.mocks"

const Story: ComponentMeta<typeof SelectTokenMenu> = {
  component: SelectTokenMenu,
  title: "Organisms/SelectTokenMenu",
}
export default Story

const Template: ComponentStory<typeof SelectTokenMenu> = ({
  selectedToken: defaultSelectedToken,
  ...args
}) => {
  const [selectedTokenValue, setSelectedTokenValue] = React.useState(
    defaultSelectedToken.value,
  )
  const selectedToken = args.tokenOptions.find(
    (token) => token.value === selectedTokenValue,
  )

  return (
    <SelectTokenMenu
      {...args}
      selectedToken={selectedToken || args.tokenOptions[0]}
      onSelectToken={setSelectedTokenValue}
    />
  )
}

export const Primary = Template.bind({})
Primary.args = {
  selectedToken: {
    label: "ICP",
    value: "ICP",
    icon: IconSvgDfinity,
  },
  tokenOptions: TOKEN_OPTIONS,
}
