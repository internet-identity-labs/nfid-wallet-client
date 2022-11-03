# Integration Layer

- Modules in this directory:
  - provide functions to enable data fetching across networks,
  - provide functions to map or "normalize" data from external resources into an idiomatic format,
  - contain definitions for internet computer canister actors,
  - provide integration testing for our external communication layer,
  - provides factory functions to generate communication layer stubs.

## Directory structure

- `service-directory`
  - `__mocks.ts`
    - data stubs and factory method to stub the service's entities
  - `index.ts`
    - constants
    - types
    - maps
    - fetch
    - queries
  - `index.spec.ts`
