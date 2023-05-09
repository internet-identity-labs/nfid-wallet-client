import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ic-loading')
export class LoadingElement extends LitElement {
  render(): TemplateResult {
    return html`<img width="125px" height="125px" src="/loader.webp" />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ic-loading': LoadingElement;
  }
}
