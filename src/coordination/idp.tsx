import React from 'react'
import { useMachine, useActor } from '@xstate/react'
import { ActorRef, State } from 'xstate'

import IDPMachine from 'frontend/state/authorization/idp'
import { Events as AuthEvents, Context as AuthContext, Schema as AuthSchema } from 'frontend/state/authentication'
import { Events as AuthoEvents, Context as AuthoContext, Schema as AuthoSchema } from 'frontend/state/authorization'
import { Events as UnknownEvents, Context as UnknownContext, Schema as UnknownSchema } from 'frontend/state/authentication/unknown-device'
import { Events as KnownEvents, Context as KnownContext, Schema as KnownSchema } from 'frontend/state/authentication/known-device'
import { AuthorizeDecider } from 'frontend/design-system/pages/authorize-decider'

type AuthStates = import("frontend/state/authentication/index.typegen").Typegen0['matchesStates']
type AuthoStates = import("frontend/state/authorization/index.typegen").Typegen0['matchesStates']
type UnknownStates = import("frontend/state/authentication/unknown-device.typegen").Typegen0['matchesStates']
type KnownStates = import("frontend/state/authentication/known-device.typegen").Typegen0['matchesStates']

export default function IDPCoordinator() {

    const machine = useMachine(IDPMachine)

    const [state, send, interpreter] = machine

    React.useEffect(() => {
        interpreter
            .onTransition((state) => console.info('PARENT TRANSITION', state.value))
            .onEvent((event) => console.info('PARENT EVENT', event.type))
    }, [interpreter])

    return <>
        {state.matches('Start') && <>Loading</>}
        {state.matches('AuthenticationMachine') && <AuthenticationCoordinator
            machine={interpreter.children.get('authenticate') as ActorRef<AuthEvents, AuthContext>}
        />}
        {state.matches('AuthorizationMachine') && <AuthorizationCoordinator
            machine={interpreter.children.get('authorize') as ActorRef<AuthoEvents, AuthoContext>}
        />}
    </>

}

function AuthenticationCoordinator({ machine }: { machine: ActorRef<AuthEvents, AuthContext> }) {
    const actor = useActor<AuthEvents, AuthContext>(machine)
    const state = actor[0] as State<AuthContext, AuthEvents, AuthSchema>;

    React.useEffect(() => console.log('AuthenticationMachine', state.value), [state.value])

    return <>
        {state.matches<AuthStates>('KnownDevice') && <KnownDeviceCoordinator
            machine={state.children['unknown-device']}
        />}
        {state.matches<AuthStates>('UnknownDevice') && <UnknownDeviceCoordinator
            machine={state.children['unknown-device']}
        />}
        {state.matches<AuthStates>('IsDeviceRegistered') && <>Loading</>}
    </>
}

function UnknownDeviceCoordinator({ machine }: { machine: ActorRef<UnknownEvents, UnknownContext> }) {
    const actor = useActor<UnknownEvents, UnknownContext>(machine)
    const state = actor[0] as State<UnknownContext, UnknownEvents, UnknownSchema>;
    const send = actor[1]

    React.useEffect(() => console.log('UnknownDeviceMachine', state.value), [state.value])

    return <>
        {state.matches<UnknownStates>('Start') && <>Loading unknown device...</>}
        {state.matches<UnknownStates>('RegistrationMachine') && <>TODO: Registration Coordinator</>}
        {state.matches<UnknownStates>('AuthSelection') && <AuthorizeDecider
            onSelectRemoteAuthorization={() => send('AUTH_WITH_REMOTE')}
            onSelectSameDeviceRegistration={() => console.log('VOID: SAME DEVICE')}
            onSelectSameDeviceAuthorization={() => console.log('VOID: SAME DEVICE AUTHO')}
            onSelectGoogleAuthorization={() => console.log('VOID: GOOGLE')}
            onSelectSecurityKeyAuthorization={() => console.log('VOID: SECURITY KEY')}
            onToggleAdvancedOptions={() => send('AUTH_WITH_OTHER')}
        />}
        {state.matches<UnknownStates>('AuthWithGoogle') && <>Loading google auth...</>}
        {state.matches<UnknownStates>('RemoteAuthentication') && <>TODO: Remote Auth Coordinator</>}
        {state.matches<UnknownStates>('RegisterDeviceDecider') && <>Trust this device?</>}
        {state.matches<UnknownStates>('RegisterDevice') && <>Registering...</>}
        {state.matches<UnknownStates>('RegisterDeviceError') && <>There was an error registering your device</>}
        {state.matches<UnknownStates>('ExistingAnchor') && <>Existing anchor things. AuthorizeDecider handles this in a weird way</>}
    </>
}

function KnownDeviceCoordinator({ machine }: { machine: ActorRef<KnownEvents, KnownContext> }) {
    const actor = useActor<KnownEvents, KnownContext>(machine)
    const state = actor[0] as State<KnownContext, KnownEvents, KnownSchema>;

    React.useEffect(() => console.log('KnownDeviceMachine', state.value), [state.value])

    return <>
        {state.value}
    </>
}

function AuthorizationCoordinator({ machine }: { machine: ActorRef<AuthoEvents, AuthoContext> }) {
    const actor = useActor<AuthoEvents, AuthoContext>(machine)
    const state = actor[0] as State<AuthoContext, AuthoEvents, AuthoSchema>;

    React.useEffect(() => console.log('AuthorizationMachine', state.value), [state.value])

    return <>
        {state.value}
    </>
}