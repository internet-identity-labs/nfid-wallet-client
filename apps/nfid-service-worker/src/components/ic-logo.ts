import { LitElement, html, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ic-logo')
export class LogoElement extends LitElement {
  render(): TemplateResult {
    return html`<img width="125px" height="125px" src="/loader.webp" />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ic-logo': LogoElement;
  }
}
