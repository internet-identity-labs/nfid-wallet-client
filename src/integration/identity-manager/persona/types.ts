type Anchor = string
export type RootAnchor = Anchor

export interface IIPersona {
  anchor: Anchor
  domain: string
}

export interface NFIDPersona {
  persona_id: string
  domain: string
}

export type Persona = IIPersona | NFIDPersona

export function isNFIDPersona(persona: Persona): persona is NFIDPersona {
  return typeof (persona as NFIDPersona).persona_id === "string"
}

export function isIIPersona(persona: Persona): persona is IIPersona {
  return typeof (persona as IIPersona).anchor === "string"
}
