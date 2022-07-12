/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import IDPCoordinator from './idp'
import IDPMachine from 'frontend/state/authorization/idp'

const postReady = jest.fn(() => undefined)
const isDeviceRegisteredFalse = jest.fn(() => false)
const isDeviceRegisteredTrue = jest.fn(() => false)

const testMachine = IDPMachine.withConfig({
    services: {
        async postReady() {
            postReady()
        },
    }
})

describe('IDP coordinator', () => {

    it('posts ready message upon initialization', () => {
        render(<IDPCoordinator machine={testMachine} />)
        expect(postReady.mock.calls.length).toBe(1)
    })

    describe('authentication', () => {

        describe('known device authentication', () => {

            it('renders known device flow when local device data is available', () => { })

            it('returns sign identity to parent upon completion', () => { })
        })

        describe('unknown device authentication', () => {
            it('renders unknown device flow when no local device data exists', () => { })

            describe('google authentication', () => {
                it('opens google oauth window when user selects sign in with google', () => { })

                it('ingests jwt into context upon completion of google sign in', () => { })

                it('invokes registration flow if no google account existed', () => { })

                it('does not invoke registration flow if google account already exists', () => { })

                it('returns a sign identity back to parent machine upon completion', () => { })
            })

            describe('remote device authentication', () => {
                it('navigates to remote device authentication flow', () => { })

                it('displays qr code with secret channel for remote device', () => { })

                it('polls pubsub channel for messages', () => { })

                it('displays loading indicator when it receives mobile is preparing message', () => { })

                it('receives sign identity/delegate from pubsub channel', () => { })

                it('returns sign identity to parent upon completion', () => { })
            })

            describe('existing anchor authentication', () => {
                it('navigates to existing anchor authentication flow', () => { })

                // TODO: more detail here?

                it('returns sign identity to parent upon completion', () => { })
            })

            it('returns sign identity to parent upon completion', () => { })
        })
    })

    describe('authorization', () => {
        // TODO: more detail
    })

    describe('registration', () => {
        // TODO: probably in another module
    })

    it('posts delegation upon completion', () => { })

})
