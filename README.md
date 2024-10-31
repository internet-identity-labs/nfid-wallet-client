# NFID Frontend

## Setup Development Environment

#### Prerequisites

Before setting up the development environment, ensure the following are installed:
- NodeJS v22.10.0
- Yarn v1.22.22

#### Install dependencies:
```
yarn
```

#### Copy environment configuration:
```
cp .env.local.template .env.local
```

#### Run the application:
```
npx nx serve nfid-wallet-client
```

Open the application in a browser: http://localhost:9090

#### (Optional) run legacy SDK playground:
```
npx nx serve nfid-demo
```

## Integration tests

#### Run integration tests:
```
npx env-cmd -f .env.test nx run-many --target=test --skip-nx-cache --maxAttempts=2 --maxParallel=1
```

## E2E tests

#### Prerequisites

Ensure the following is installed:
- Google Chrome

#### Run the application:
```
npx nx serve nfid-wallet-client
npx nx serve nfid-demo
```

#### Run e2e tests:
```
npx env-cmd -f .env.test nx test:e2e nfid-frontend-e2e
```

## Architecture

This architecture is inspired by:

1. [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript)
2. [bulletproof-react](https://github.com/alan2207/bulletproof-react/)
3. [react-clean-architecture](https://github.com/eduardomoroni/react-clean-architecture)

The individual applications (e.g. `nfid-wallet-client`) holds a collection of `pages` rendered on specific `urls`. Each page assembles components exported from our public interface in `package/features` without referring to any lower level implementation details.

### Libraries

⚠️ new packages **MUST** undergo security audits before installation. ⚠️

**State**

currently we're relying on these state management solutions (will be revised as having so many is not ideal):

- [jotai](https://jotai.org/) to handle global state singletons
- [xstate](https://xstate.js.org/) to manage complicated flows
- [rxjs](https://rxjs.dev/) to bridge state between vanilla js to react state

**Client side caching** - [swr](https://swr.vercel.app/)

**Forms state** - [React Hook Form](https://react-hook-form.com/)

**Routing** - [react-router-dom](https://reactrouter.com/en/main)
