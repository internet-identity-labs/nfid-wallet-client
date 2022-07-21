/**
 * @jest-environment jsdom
 */
import { DelegationChain, WebAuthnIdentity } from "@dfinity/identity"
import {
  render,
  waitFor,
  screen,
  act,
  getByPlaceholderText,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ii, im } from "frontend/integration/actors"
import { mockExternalAccountResponse } from "frontend/integration/identity-manager/__mocks"
import {
  factoryDelegationChain,
  mockWebAuthnCreate,
} from "frontend/integration/identity/__mocks"
import { II_DEVICES_DATA } from "frontend/integration/internet-identity/__mocks"
import RegistrationMachine, {
  RegistrationActor,
  RegistrationContext,
} from "frontend/state/machines/authentication/registration"

import { RegistrationCoordinator } from "./registration"
import { makeInvokedActor } from "./test-utils"

describe("Registration Coordinator", () => {
  it("should render registration intro", async () => {
    // @ts-ignore: actor class has additional things to mock
    ii.create_challenge = jest.fn(() =>
      Promise.resolve({
        png_base64: "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
        challenge_key: "challenge_key",
      }),
    )

    // @ts-ignore: actor class has additional things to mock
    ii.register = jest.fn(async () => ({
      registered: { user_number: BigInt(10_000) },
    }))

    // @ts-ignore: actor class has additional things to mock
    ii.lookup = jest.fn(async () => II_DEVICES_DATA)

    // @ts-ignore: actor class has additional things to mock
    im.create_account = jest.fn(mockExternalAccountResponse)

    WebAuthnIdentity.create = jest.fn(mockWebAuthnCreate)
    DelegationChain.create = jest.fn(factoryDelegationChain)

    const actor = makeInvokedActor<RegistrationContext>(RegistrationMachine, {})
    const { container } = render(
      <RegistrationCoordinator actor={actor as RegistrationActor} />,
    )

    await waitFor(() => {
      screen.getByText("Sign in")
    })

    expect(ii.create_challenge).toHaveBeenCalled()

    act(() => {
      screen.getByText("Create a new NFID").click()
    })
    expect(WebAuthnIdentity.create).toHaveBeenCalled()

    await waitFor(() => {
      screen.getByText("Complete NFID registration")
    })

    const CreateNFIDButton = screen.getByText("Create NFID")
    expect(CreateNFIDButton.getAttribute("class")).toContain("btn-disabled")

    act(() => {
      userEvent.type(getByPlaceholderText(container, "Enter characters"), "a")
    })

    expect(CreateNFIDButton.getAttribute("class")).not.toContain("btn-disabled")

    await act(async () => {
      await waitFor(() => CreateNFIDButton.click())
    })

    expect(DelegationChain.create).toHaveBeenCalledTimes(1)
    expect(im.create_account).toHaveBeenCalledTimes(1)
    expect(ii.register).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      screen.getByText("RegistrationCoordinator")
    })

    expect(actor?.getSnapshot().value).toBe("End")
  })
})
