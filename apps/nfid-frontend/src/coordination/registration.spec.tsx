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

import { ii, im } from "@nfid/integration"

import { iiCreateChallengeMock } from "frontend/integration/actors.mocks"
import {
  mockCreateAccessPointResponse,
  mockExternalAccountResponse,
  mockGetAccountResponse,
} from "frontend/integration/identity-manager/__mocks"
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

jest.mock("lottie-web", () => ({
  loadAnimation: jest.fn().mockReturnValue({}),
}));

describe("Registration Coordinator", () => {
  // FIXME: skip for now to unblock CI.
  // Working on it it SC-5907
  it.skip("should render registration intro", async () => {
    // @ts-ignore: actor class has additional things to mock
    ii.create_challenge = jest.fn(iiCreateChallengeMock)

    // @ts-ignore: actor class has additional things to mock
    ii.register = jest.fn(async () => ({
      registered: { user_number: BigInt(10_000) },
    }))

    // @ts-ignore: actor class has additional things to mock
    ii.lookup = jest.fn(async () => II_DEVICES_DATA)

    // @ts-ignore: actor class has additional things to mock
    im.create_account = jest.fn(mockExternalAccountResponse)
    // @ts-ignore: actor class has additional things to mock
    im.create_access_point = jest.fn(mockCreateAccessPointResponse)
    // @ts-ignore: actor class has additional things to mock
    im.get_account = jest.fn(mockGetAccountResponse)

    jest.useFakeTimers().setSystemTime(new Date("1969-01-01T00:27:48.512Z"))

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
      screen.getByText("Continue with enhanced security").click()
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

    await waitFor(() => {
      screen.getByText("Registered successful")
    })

    expect(DelegationChain.create).toHaveBeenCalledTimes(1)
    expect(ii.register).toHaveBeenCalledTimes(1)
    expect(im.create_account).toHaveBeenCalledTimes(1)
    expect(im.create_access_point).toHaveBeenCalledTimes(1)

    expect(actor?.getSnapshot().value).toBe("End")
  })
})
