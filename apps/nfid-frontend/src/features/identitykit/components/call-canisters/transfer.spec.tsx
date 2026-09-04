// The `@nfid-frontend/ui` barrel re-exports the entire design system,
// including LottieAnimation (crashes at import time under jsdom, since
// lottie-web probes canvas 2D support) and a carousel built on the
// ESM-only @fancyapps/ui (not transformed by this project's Jest config).
// transfer.tsx and RPCPromptTemplate only need Address/Button/LogoMain, so
// stub the barrel instead of pulling in that whole transitive tree.
jest.mock("@nfid-frontend/ui", () => ({
  Address: ({ address }: { address: string }) => <div>{address}</div>,
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  LogoMain: "logo-main.svg",
}))

import React from "react"

import { render, screen } from "@testing-library/react"

import CallCanisterTransfer from "./transfer"
import { TransferMetadata } from "../../service/canister-calls-helpers/interfaces"

const buildMetadata = (
  overrides: Partial<TransferMetadata> = {},
): TransferMetadata => ({
  toAddress: "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae",
  amount: "100000000",
  balance: "1000000000",
  isInsufficientBalance: false,
  address: "2vxsx-fae",
  symbol: "ICP",
  decimals: 8,
  fee: "10000",
  total: "100010000",
  ...overrides,
})

const renderComponent = (
  metadataOverrides: Partial<TransferMetadata> = {},
  onApprove = jest.fn(),
  onReject = jest.fn(),
) => {
  const metadata = buildMetadata(metadataOverrides)
  render(
    <CallCanisterTransfer
      origin="https://dapp.example"
      canisterId="ryjl3-tyaaa-aaaaa-aaaba-cai"
      methodName="transfer"
      args="[]"
      request={{ id: "1" }}
      metadata={metadata}
      onApprove={onApprove}
      onReject={onReject}
    />,
  )
  return { metadata, onApprove, onReject }
}

describe("CallCanisterTransfer", () => {
  it("should render the title, requesting dApp host and destination address", () => {
    const { metadata } = renderComponent()

    expect(screen.getByText("Approve transfer")).toBeInTheDocument()
    expect(screen.getByText("dapp.example")).toBeInTheDocument()
    expect(screen.getByText(metadata.toAddress)).toBeInTheDocument()
  })

  it("should not render a memo row when no memo is present", () => {
    renderComponent()

    expect(screen.queryByText("Memo")).not.toBeInTheDocument()
  })

  it("should render the memo row when a memo is present", () => {
    renderComponent({ memo: "ec" })

    expect(screen.getByText("Memo")).toBeInTheDocument()
    expect(screen.getByText("ec")).toBeInTheDocument()
  })

  it("should show an insufficient balance warning and disable Approve when the balance is too low", () => {
    renderComponent({ isInsufficientBalance: true })

    expect(screen.getByText("Insufficient ICP balance")).toBeInTheDocument()
    expect(screen.getByText("Approve")).toBeDisabled()
  })

  it("should not show a warning and keep Approve enabled when the balance is sufficient", () => {
    renderComponent({ isInsufficientBalance: false })

    expect(
      screen.queryByText("Insufficient ICP balance"),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Approve")).not.toBeDisabled()
  })

  it("should call onApprove with the original request when Approve is clicked", () => {
    const onApprove = jest.fn()
    renderComponent({}, onApprove, jest.fn())

    screen.getByText("Approve").click()

    expect(onApprove).toHaveBeenCalledWith({ id: "1" })
  })

  it("should call onReject when Reject is clicked", () => {
    const onReject = jest.fn()
    renderComponent({}, jest.fn(), onReject)

    screen.getByText("Reject").click()

    expect(onReject).toHaveBeenCalledTimes(1)
  })
})
