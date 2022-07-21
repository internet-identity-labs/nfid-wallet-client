# Unknown Device Machine

[Registration Machine](../registration/registration.md)

[Remote Auth Receiver](./remote-auth-receiver.md)

[Authorization Machine](../authorization.md)

## Initiators

[Authentication Machine](./.root.md)

```mermaid
sequenceDiagram

  actor User

  participant Initiator
  participant Unknown Device Machine

  participant Google Service
  participant Registration Machine
  participant Remote Auth Receiver Machine

  Initiator->>+Unknown Device Machine: invoke(includeAuthorization:boolean)


  par is mobile device with webAuthN support
      Unknown Device Machine->>+Registration Machine: invoke()
      Registration Machine->>-Unknown Device Machine: sign_identity, anchor
  end
  par Google Sign in
    User->>Unknown Device Machine: clicks Google Button
    Unknown Device Machine->>Unknown Device Machine: retrieve jwt
    Unknown Device Machine->>+Google Service: get_key(jwt)
    Google Service->>-Unknown Device Machine: sign_identity, is_existing
    alt !is_existing
      Unknown Device Machine->>+Registration Machine: invoke(sign_identity)
      Registration Machine->>-Unknown Device Machine: sign_identity, anchor
    end
  end

  par Remote Authentication
    User->>Unknown Device Machine: clicks remote sign in
    Unknown Device Machine->>+Remote Auth Receiver Machine: invoke(includeAuthorization:boolean)
    alt should include authorization
      Remote Auth Receiver Machine->>Unknown Device Machine: sign_identity, app_delegation
    else without authorization
      Remote Auth Receiver Machine->>-Unknown Device Machine: sign_identity
    end
  end

  par Existing Anchor
    User->>Unknown Device Machine: clicks other sign in options
    User->>Unknown Device Machine: types in anchor
    User->>Unknown Device Machine: clicks get credential from biometric sensor
    alt retrieve credential
      Unknown Device Machine->>Unknown Device Machine: retrieve sign_identity
    else don't retrieve credential
      Unknown Device Machine->>Unknown Device Machine: show error
    end
  end

  alt include authorization and !app_delegate
    Unknown Device Machine->>+Authorization Machine: invoke(sign_identity)
    Authorization Machine->>-Unknown Device Machine: app_delegate
    Unknown Device Machine->>Initiator: sign_identity, app_delegate
  else don't include authorization
    Unknown Device Machine->>-Initiator: sign identity
  end

```
