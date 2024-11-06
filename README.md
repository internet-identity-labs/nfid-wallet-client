# NFID Wallet

Welcome to the first-ever DAO-controlled, decentralized, Web3 wallet client repository. NFID Wallet DAO is on a mission to make Web3 accessible to everyone by championing ICP as the entry point and NFID Wallet as the gateway to the decentralized internet.

---

## Table of Contents
- [About](#about)
- [Setup Development Environment](#setup-development-environment)
  - [Prerequisites](#prerequisites)
  - [Install Dependencies](#install-dependencies)
  - [Copy Environment Configuration](#copy-environment-configuration)
  - [Run the Application](#run-the-application)
  - [Run Legacy SDK Playground (Optional)](#run-legacy-sdk-playground-optional)
- [Testing](#testing)
  - [Integration Tests](#integration-tests)
  - [E2E Tests](#e2e-tests)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Community & Support](#community--support)

---

## About

The current repository is the frontend interface for NFID, offering a user-friendly entry point into Web3. Built with decentralized architecture principles, NFID Wallet brings Web3 to everyone by bridging users to the ICP ecosystem through a DAO-managed, decentralized wallet.

---

## Setup Development Environment

### Prerequisites

Before setting up, ensure the following are installed:

- **NodeJS** `v22.10.0`
- **Yarn** `v1.22.22`

### Install Dependencies

Install all necessary dependencies:

```bash
yarn
```

### Copy Environment Configuration

Copy the environment template:

```bash
cp .env.local.template .env.local
```

### Run the Application

Start the application locally:

```bash
npx nx serve nfid-wallet-client
```

Access the application in your browser at: [http://localhost:9090](http://localhost:9090)

### Run Legacy SDK Playground (Optional)

To run the legacy SDK playground:

```bash
npx nx serve nfid-demo
```

---

## Testing

### Integration Tests

Run integration tests with:

```bash
npx env-cmd -f .env.test nx run-many --target=test --skip-nx-cache --maxAttempts=2 --maxParallel=1
```

### E2E Tests

#### Prerequisites

Install Google Chrome for E2E tests.

#### Run the Application

To start both client and demo apps for testing:

```bash
npx nx serve nfid-wallet-client
npx nx serve nfid-demo
```

#### Run E2E Tests

Execute end-to-end tests using:

```bash
npx env-cmd -f .env.test nx test:e2e nfid-frontend-e2e
```

---

## Deployment

Deploying to the Internet Computer is managed with DFX v0.24.1. Ensure it’s installed and configured before proceeding with deployment.

---

## Architecture

This architecture is inspired by:

- **[clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript)**
- **[bulletproof-react](https://github.com/alan2207/bulletproof-react/)**
- **[react-clean-architecture](https://github.com/eduardomoroni/react-clean-architecture)**

Each application, such as `nfid-wallet-client`, consists of `pages` that render specific URLs. Pages are assembled from components exported via our public interface in `package/features`, ensuring modularity and clean separation of concerns.

### Libraries

⚠️ New packages **MUST** undergo security audits before installation. ⚠️

- **State Management**:  
  - [jotai](https://jotai.org/): for global state singletons
  - [xstate](https://xstate.js.org/): for managing complex flows
  - [rxjs](https://rxjs.dev/): to bridge vanilla JavaScript and React state

- **Client-side Caching** - [swr](https://swr.vercel.app/)
- **Forms** - [React Hook Form](https://react-hook-form.com/)
- **Routing** - [react-router-dom](https://reactrouter.com/en/main)

---

## Community & Support

Connect with the NFID Wallet community for support, updates, and discussions:

- [Discord](https://discord.gg/a9BFNrYJ99)
- [OpenChat](https://oc.app/community/66hym-7iaaa-aaaaf-bm7aa-cai/channel/1241143482/?ref=prkg5-paaaa-aaaaf-aqbia-cai)

> **Web3 is all about community!** Let’s build, support, and grow together 🚀
