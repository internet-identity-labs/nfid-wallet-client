import React from 'react'
import { useMachine, useActor } from '@xstate/react'

import IDPMachine from 'frontend/state/authorization/idp'
import { AuthenticationActor } from 'frontend/state/authentication'
import { AuthorizationActor } from 'frontend/state/authorization'
import { UnknownDeviceActor } from 'frontend/state/authentication/unknown-device'
import { KnownDeviceActor } from 'frontend/state/authentication/known-device'
import { AuthorizeDecider } from 'frontend/design-system/pages/authorize-decider'

interface Actor<T> {
    actor: T
}

export default function IDPCoordinator() {

    const machine = useMachine(IDPMachine)

    const [state] = machine

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

    return <>
        {state.matches('Start') && <>Loading unknown device...</>}
        {state.matches('RegistrationMachine') && <>TODO: Registration Coordinator</>}
        {state.matches('AuthSelection') && <AuthorizeDecider
            onSelectRemoteAuthorization={() => send('AUTH_WITH_REMOTE')}
            onSelectSameDeviceRegistration={() => console.log('VOID: SAME DEVICE')}
            onSelectSameDeviceAuthorization={() => console.log('VOID: SAME DEVICE AUTHO')}
            onSelectGoogleAuthorization={() => console.log('VOID: GOOGLE')}
            onSelectSecurityKeyAuthorization={() => console.log('VOID: SECURITY KEY')}
            onToggleAdvancedOptions={() => send('AUTH_WITH_OTHER')}
        />}
        {state.matches('AuthWithGoogle') && <>Loading google auth...</>}
        {state.matches('RemoteAuthentication') && <>TODO: Remote Auth Coordinator</>}
        {state.matches('RegisterDeviceDecider') && <>Trust this device?</>}
        {state.matches('RegisterDevice') && <>Registering...</>}
        {state.matches('RegisterDeviceError') && <>There was an error registering your device</>}
        {state.matches('ExistingAnchor') && <>Existing anchor things. AuthorizeDecider handles this in a weird way</>}
    </>
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