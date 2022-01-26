type PersonaName = string
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
