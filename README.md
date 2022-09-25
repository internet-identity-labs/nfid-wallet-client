<!-- vscode-markdown-toc -->

- 1. [Setup development environment](#Setupdevelopmentenvironment)
  - 1.1. [Install Frontend](#InstallFrontend)
  - 1.2. [Install dfx](#Installdfx)
  - 1.3. [Install ngrok (https tunnel for mobile device)](#Installngrokhttpstunnelformobiledevice)
  - 1.4. [configure environment](#configureenvironment)
    - 1.4.1. [`II_MODE`: used to decide if we need to fetch rootkeys](#II_MODE:usedtodecideifweneedtofetchrootkeys)
    - 1.4.2. [`INTERNET_IDENTITY_CANISTER_ID`: Internet Identity Frontend Canister ID](#INTERNET_IDENTITY_CANISTER_ID:MultipassFrontendCanisterID)
    - 1.4.3. [`TUNNEL_DOMAIN`: The domain which should be used for the qrcode](#TUNNEL_DOMAIN:Thedomainwhichshouldbeusedfortheqrcode)
- 2. [Available scripts](#Availablescripts)
  - 2.1. [yarn dev](#yarndev)
  - 2.2. [yarn tunnel](#yarntunnel)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

# Multipass Frontend

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
