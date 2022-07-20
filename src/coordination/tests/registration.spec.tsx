/**
 * @jest-environment jsdom
 */
import { render, waitFor, screen } from "@testing-library/react"

import RegistrationMachine, {
  RegistrationActor,
  RegistrationContext,
} from "frontend/state/machines/authentication/registration"

import { RegistrationCoordinator } from "../registration"
import { makeInvokedActor } from "./_util"

describe("Registration Coordinator", () => {
  it("should render registration intro", async () => {
    const actor = makeInvokedActor<RegistrationContext>(RegistrationMachine, {})
    render(<RegistrationCoordinator actor={actor as RegistrationActor} />)
    await waitFor(() => {
      screen.getByText("Sign in")
    })
  })
})
