/**
 * @jest-environment jsdom
 */
import { WebAuthnIdentity } from "@dfinity/identity"
import {
  render,
  waitFor,
  screen,
  act,
  fireEvent,
  getByPlaceholderText,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ii, im } from "frontend/integration/actors"
import RegistrationMachine, {
  RegistrationActor,
  RegistrationContext,
} from "frontend/state/machines/authentication/registration"

import { RegistrationCoordinator } from "../registration"
import { makeInvokedActor } from "./_util"

describe("Registration Coordinator", () => {
  it("should render registration intro", async () => {
    // @ts-ignore
    ii.create_challenge = jest.fn(() =>
      Promise.resolve({
        png_base64: "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
        challenge_key: "challenge_key",
      }),
    )
    WebAuthnIdentity.create = jest.fn()

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

    // NOTE: mock outgoing calls to make this work
    // act(() => {
    //   CreateNFIDButton.click()
    // })

    // await waitFor(() => {
    //   screen.getByText("Registering NFID")
    // })
  })
})
