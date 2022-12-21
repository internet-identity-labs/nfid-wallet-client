import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import clsx from "clsx"

import { SelectedToken } from "./selected-token"
import { TokenOption } from "./token-options"

export type TokenOption = {
  label: string
  value: string
  icon: string
  tokenStandard: string
}

type SelectTokenMenuProps = {
  tokenOptions: TokenOption[]
  selectedToken: TokenOption
  onSelectToken: (token: string) => void
}

export const SelectTokenMenu: React.FC<SelectTokenMenuProps> = ({
  tokenOptions,
  selectedToken,
  onSelectToken,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className="hover:cursor-pointer">
          <SelectedToken
            symbol={selectedToken.value}
            icon={selectedToken.icon}
          />
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className={clsx("rounded py-2 space-y-1 shadow-lg bg-white z-[1000]")}
        sideOffset={5}
      >
        <DropdownMenu.Arrow className="fill-white" />
        <DropdownMenu.Label className="px-2 text-xs text-gray-500">
          Token
        </DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={selectedToken.value}
          onValueChange={onSelectToken}
        >
          {tokenOptions.map((token) => (
            <DropdownMenu.RadioItem value={token.value} key={token.value}>
              <TokenOption
                value={token.value}
                icon={token.icon}
                isSelected={token.value === selectedToken.value}
              />
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
