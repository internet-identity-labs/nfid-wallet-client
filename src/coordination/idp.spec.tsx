/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import IDPCoordinator from './idp'
import IDPMachine from 'frontend/state/authorization/idp'

const testMachine = IDPMachine.withConfig({})

test('renders', () => {
    render(<IDPCoordinator machine={testMachine} />)
    expect(screen.getByText('Loading')).toBeDefined()
})
