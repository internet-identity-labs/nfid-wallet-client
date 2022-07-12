import React from 'react'
import { useMachine, useActor } from '@xstate/react'

import IDPMachine, { IDPMachineType } from 'frontend/state/authorization/idp'
import { AuthenticationActor } from 'frontend/state/authentication'
import { AuthorizationActor } from 'frontend/state/authorization'
import { UnknownDeviceActor } from 'frontend/state/authentication/unknown-device'
import { KnownDeviceActor } from 'frontend/state/authentication/known-device'
import { AuthorizeDecider } from 'frontend/design-system/pages/authorize-decider'

interface Actor<T> {
    actor: T
}

interface Props {
    machine?: IDPMachineType
}

export default function IDPCoordinator({ machine }: Props) {

    const [state] = useMachine(machine || IDPMachine)

    return <>
        {state.matches('Start') && <>Loading</>}
        {state.matches('AuthenticationMachine') && <AuthenticationCoordinator
            actor={state.children.authenticate as AuthenticationActor}
        />}
        {state.matches('AuthorizationMachine') && <AuthorizationCoordinator
            actor={state.children.authorize as AuthorizationActor}
        />}
    </>

}

function AuthenticationCoordinator({ actor }: Actor<AuthenticationActor>) {
    const [state] = useActor(actor)

    React.useEffect(() => console.log('AuthenticationMachine', state.value), [state.value])

    return <>
        {state.matches('KnownDevice') && <KnownDeviceCoordinator
            actor={state.children['unknown-device'] as KnownDeviceActor}
        />}
        {state.matches('UnknownDevice') && <UnknownDeviceCoordinator
            actor={state.children['unknown-device'] as UnknownDeviceActor}
        />}
        {state.matches('IsDeviceRegistered') && <>Loading</>}
    </>
}

function UnknownDeviceCoordinator({ actor }: Actor<UnknownDeviceActor>) {
    const [state, send] = useActor(actor)

    React.useEffect(() => console.log('UnknownDeviceMachine', state.value), [state.value])

    switch (true) {
        case state.matches('End'):
        case state.matches('Start'):
            return <>Loading unknown device...</>
        case state.matches('ExistingAnchor'):
        case state.matches('AuthSelection'):
            return <AuthorizeDecider
                onSelectRemoteAuthorization={() => send('AUTH_WITH_REMOTE')}
                onSelectSameDeviceRegistration={() => console.log('VOID: SAME DEVICE')}
                onSelectSameDeviceAuthorization={() => console.log('VOID: SAME DEVICE AUTHO')}
                onSelectGoogleAuthorization={() => console.log('VOID: GOOGLE')}
                onSelectSecurityKeyAuthorization={() => console.log('VOID: SECURITY KEY')}
                onToggleAdvancedOptions={() => send('AUTH_WITH_OTHER')}
                showAdvancedOptions={state.matches('ExistingAnchor')}
            />
        case state.matches('RegistrationMachine'):
            return <>TODO: RegistrationCoordinator</>
        case state.matches('AuthWithGoogle'):
            return <>Loading google auth...</>
        case state.matches('RemoteAuthentication'):
            return <>TODO: Remote Auth Coordinator</>
        case state.matches('RegisterDeviceDecider'):
            return <>Trust this device?</>
        case state.matches('RegisterDevice'):
            return <>Registering...</>
        case state.matches('RegisterDeviceError'):
            return <>There was an error registering your device</>
        default:
            return <div>loading</div>
    }
}

function KnownDeviceCoordinator({ actor }: Actor<KnownDeviceActor>) {
    const [state] = useActor(actor)

    React.useEffect(() => console.log('KnownDeviceMachine', state.value), [state.value])

    return <>
        {state.value}
    </>
}

function AuthorizationCoordinator({ actor }: Actor<AuthorizationActor>) {
    const [state] = useActor(actor)

    React.useEffect(() => console.log('AuthorizationMachine', state.value), [state.value])

    return <>
        {state.value}
    </>
}