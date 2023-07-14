# NFID Frontend

## Setup development environment

### Install dependencies

```
yarn login --registry=https://npm.pkg.github.com --scope=@psychedelic
yarn
```

_In some cases you may run into trouble seeing message like_

```
yarn install vx.xx.xx
error An unexpected error occurred: "Failed to replace env in config: ${NPM_TOKEN}".
info If you think this is a bug, please open a bug report with the information provided
```

_To fix this, make sure node (along with npm) and yarn are installed, then do the following:_

- open your github account
- navigate to Settings
- navigate to Developer Settings (usually it's on the bottom side)
- open Personal access tokens
- click on Tokens (classic)
- Generate New Token (classic)
- type a name
- pick `write:packages`, `read:packages`, `repo` (all) checkmarks and save changes (Update Token)
- copy it (everything after `ghp_`)
- go to your user directory (e.g. /Users/<your_username> on UNIX based OS)
- find `.npmrc` file (if there is none just create it)
- add the following lines to this file

```
@psychedelic:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=ghp_xxxxx
```

- _where xxxxx is your github token_

### Install latest dfx

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

### Install ngrok (https tunnel for mobile device)

[download ngrok](https://dashboard.ngrok.com/get-started/setup) and unzip to `./scrips/ngrok`

setup your authtoken (copy from ngrok dashboard)

```
./scripts/ngrok authtoken <YOUR_AUTH_TOKEN>
```

### Environment config

```
cp .env.local.template .env.local
```

Update user specific `TUNNEL_DOMAIN` vairables within your local copy `.env.local`. This is the domain which should be used for the qrcode.

example

```
TUNNEL_DOMAIN=3540a630b330.ngrok.io
```

## Available scripts

when you're working with vscode you can use the task runner to start the development environment. Press `CMD+SHIFT+P` then type `run task` and select from:

1. NFID Frontend (`npx nx serve nfid-frontend`)
2. NFID Demo (`npx nx serve nfid-demo`)
3. NFID Storybook (`npx nx storybook ui`)
4. etc...

## Deployment

NFID Frontend is deployed to [cloudflare pages](https://dash.cloudflare.com/2680fff2f5b4404ed84e1395cfda8afd/pages/view/nfid-frontend). The latest dev version ([staging.nfid.one](https://staging.nfid.one)) is deployed when a PR is merged into `main` branch. [nfid.one](https://nfid.one) is deployed when a PR is merged into `production` branch.

- [Domain Configuration](https://dash.cloudflare.com/2680fff2f5b4404ed84e1395cfda8afd/pages/view/nfid-frontend/domains)
- [General Setting](https://dash.cloudflare.com/2680fff2f5b4404ed84e1395cfda8afd/pages/view/nfid-frontend/settings)

All `feature/*` branches are deployed as preview to `https://<branch-prefix>.nfid-frontend.pages.dev`. The cloudflare bot comments the preview url to the PR.

**NOTE:** To test these preview deployments, it is important to add the exact url to [google authClient config in console.cloud.google.com](https://console.cloud.google.com/apis/credentials/oauthclient/339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com?project=leafy-chariot-353306) as `Authorized JavaScript origins`:

![authorized-java-script-origins.png](./docs/authorized-javascript-origins.png)

## Architecture

To build a scalable and reusable application architecture we're applying a modular approach which can be described by the following diagram:

```mermaid
flowchart BT
    app([Application]) --> feature([feature])
    feature --> config([config]) & integration([integration]) & ui([ui-kit])
```

This architecture is inspired by:

1. [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript)
2. [bulletproof-react](https://github.com/alan2207/bulletproof-react/)
3. [react-clean-architecture](https://github.com/eduardomoroni/react-clean-architecture)

The individual applications (e.g. `nfid-frontend`) holds a collection of `pages` rendered on specific `urls`. Each page assembles components exported from our public interface in `package/features` without referring to any lower level implementation details.

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

**TODOs**

- [ ] replace [@headlessui/react](https://bundlephobia.com/package/@headlessui/react@1.7.4) with [@radix-ui](https://www.radix-ui.com/) as wrapped ui-kit components
- [ ] replace [react-awesome-reveal](https://bundlephobia.com/package/react-awesome-reveal@4.1.0) with [@react-motion](https://bundlephobia.com/package/react-motion@0.5.2) as wrapped ui-kit components
- [ ] replace [react-toastify]() [@radix-ui/react-toast](https://www.radix-ui.com/docs/primitives/components/toast#toast) as wrapped ui-kit components
- [ ] replace [react-tooltip]() with [@radix-ui/react-tooltip](https://www.radix-ui.com/docs/primitives/components/tooltip#tooltip) as wrapped ui-kit components
- [ ] replace [react-scroll-parallax](), [react-scrollspy](), [stickyfilljs]() with [react-viewport-utils](https://www.npmjs.com/package/react-viewport-utils)

### Applications within the mono repo

```
apps/
  nfid-demo/
  nfid-frontend/
  nfid-frontend-e2e/
```

### Modular application architecture

**TODOs**

- [ ] define feature scaffold
- [ ] define page scaffold
- [ ] extract/bundle components into features
- [ ] extract/bundle integration/state components into `packages/integration` and `packages/features`

```
apps/nfid-frontend/

  pages/          # connected container components
    profile/        # nfid.one/profile/ (resolves to index.ts within that folder)
      assets/         # nfid.one/profile/assets
        cmp/
        hooks/
        constants.ts    # contains constant configuration defaults
        intex.ts        # exposes public interface. Nowhere else will be exported

      applications/   # nfid.one/profile/applications
      credentials/    # nfid.one/profile/credentials
      security/       # nfid.one/profile/security
      index.ts

  flows/          # coordination layer which sticks multiple pages into a flow
    idp/

```

### Packages within the mono repo

```
packages/
  config/         # Shared configuration and constants
  integration/    # Shared api/backend integration
    _ic_api/        # generated idlFactories and types
    actors.ts       # icp interface
    index.ts        # exports public accessible interface

  utils/          # vanilly typescript helper
  react-utils/    # shared react helper
    hooks/          # shared react helper
    provider/       # shared react helper

  ui/             # Shared dumb UI components
    atoms/        # smalles building blocks e.g. button
    molecules/    # combines atoms e.g. input field with label and error component
    organisms/    # combines molecules e.g search field with icon input field and button
    templates/    # full reusable page templates/layouts

  features/       # modular main feature integrated on multiple pages
    authentication/
    authorization/
    account-recovery/
    authorized-devices/
    applications/
    nfts/
    phone-number-credential/
    send-receive-icp/
```


### If you want to add new Test User

- navigate to `helpers` folder
- make sure you have viewed the list of `users.json` and there is none matching your purposes
- you can create a brand new user right from your machine using the standard Sign Up form
- DON'T click 'Trust this device' on last step
- once authenticated navigate to Security
- create a seed phrase (if this step is skipped during Sign Up)
- create a new JSON in the end of `users.json`
- add this seed phrase
- open SignIn.feature
- add some custom tag (e.g. @mycustomtag or @runthis) right above `Scenario: User authenticates with recovery phrase (FAQ)`
- replace step `And It log's me in` with `When User trusts this device` within the same scenario
- open this step details
- add `const auth: string = ` in front of line `await browser.addVirtualAuthenticator("ctap2", "internal", true, true, true, true)`, this will save the authenticator id
- add `// @ts-ignore` above this `const auth: string = ` line
- in the end of this step add `const creds = await browser.getCredentials(auth)`, you may also add `console.log(JSON.stringify(creds.toString))` next line to see the actual credentials
- after the above lines added add finish one `await browser.debug()` to stop wdio scenario, so you can check the info
- run this particular scenario with cmd `npx nx test:e2e nfid-frontend-e2e --cucumberOpts.tagExpression='@runthis'`
- once stop on debug, check the localstorage within wdio browser (F12->Application->Localstorage->account), copy it
- add localstorage info in your test user JSON within `account` tag (make sure there is anchor appears, it should match the seed phrase)
- grab the credentials from logs and add them within `credentials` tag for your test user
- that's it, a new user is ready
- if you feel like there is an additional field should be added (e.g. for some token address), add it to `type TestUser` in `types.d.ts` file

