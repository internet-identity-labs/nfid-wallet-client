<!-- vscode-markdown-toc -->

- 1. [Setup development environment](#Setupdevelopmentenvironment)
  - 1.1. [Install Frontend](#InstallFrontend)
  - 1.2. [Install dfx](#Installdfx)
  - 1.3. [Install ngrok (https tunnel for mobile device)](#Installngrokhttpstunnelformobiledevice)
  - 1.4. [configure environment](#configureenvironment)
    - 1.4.1. [`TUNNEL_DOMAIN`: The domain which should be used for the qrcode](#TUNNEL_DOMAIN:Thedomainwhichshouldbeusedfortheqrcode)
- 2. [Available scripts](#Availablescripts)
  - 2.1. [yarn dev](#yarndev)
  - 2.2. [yarn tunnel](#yarntunnel)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

# NFID Frontend

## 1. <a name='Setupdevelopmentenvironment'></a>Setup development environment

### 1.1. <a name='InstallFrontend'></a>Install Frontend

```
npm login --registry=https://npm.pkg.github.com --scope=@psychedelic
yarn install
```

### 1.2. <a name='Installdfx'></a>Install dfx

```
DFX_VERSION=0.9.3 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

### 1.3. <a name='Installngrokhttpstunnelformobiledevice'></a>Install ngrok (https tunnel for mobile device)

[download ngrok](https://dashboard.ngrok.com/get-started/setup) and unzip to `./scrips/ngrok`

setup your authtoken

```
./scripts/ngrok authtoken <YOUR_AUTH_TOKEN>
```

### 1.4. <a name='configureenvironment'></a>configure environment

copy the env template:

```
cp .env.local.template .env.local
```

#### 1.4.1. <a name='TUNNEL_DOMAIN:Thedomainwhichshouldbeusedfortheqrcode'></a>`TUNNEL_DOMAIN`: The domain which should be used for the qrcode

> this is mainly for development purposes

example

```
TUNNEL_DOMAIN=3540a630b330.ngrok.io
TUNNEL_REGION=<us or eu>
```

## 2. <a name='Availablescripts'></a>Available scripts

### 2.1. <a name='yarndev'></a>yarn dev

starts the frontend in development mode

```
yarn dev
```

### 2.2. <a name='yarntunnel'></a>yarn tunnel

starts ngrok tunnel for testing on mobile device while development

```
yarn tunnel
```

## Architecture

### Applications within the mono repo

```
apps/
  nfid-demo/
  nfid-frontend/
  nfid-frontend-e2e/
```

### Packages within the mono repo

```
packages/
  config/         # Shared repo configuration
  common/         # Shared common
    _ic_api/        # generated idlFactories and types
    actors.ts       # icp interface
    intex.ts        # exports public accessible interface
  constants/      # Shared configuration defaults

  ui/             # Shared dumb UI components
    atoms/        # smalles building blocks e.g. button
    molecules/    # combines atoms e.g. input field with label and error component
    organisms/    # combines molecules e.g search field with icon input field and button
    templates/    # full reusable page templates/layouts

  features/       # modular main feature integrated on multiple pages
    account-recovery/
    authorized-devices/
    applications/
    nfts/
    phone-number-credential/
    send-receive-icp/
```

### Modular application architecture

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
