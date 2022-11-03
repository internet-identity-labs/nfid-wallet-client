```mermaid
sequenceDiagram

    participant Client
    participant IDP Machine
    participant Authentication Flow
    participant Authorization flow

    Client->>IDP Machine: Connect
    IDP Machine->>Client: Ready message
    Client->>IDP Machine: Authorize request message
    IDP Machine->>Authentication Flow: start
    Authentication Flow->>IDP Machine: sign identity
    IDP Machine->>Authorization flow: Authorization flow (sign identity)
    Authorization flow->>IDP Machine: delegate

    IDP Machine->>Client: authorize-client-success message: delegate
```
