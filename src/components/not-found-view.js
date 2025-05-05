import { LitElement, html, css } from "lit";
import { t } from "../localization/localization.js";

class NotFoundView extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      text-align: center;
      color: #dc3545;
      font-size: 11px;
    }
    h2 {
      margin-bottom: 1rem;
      font-size: 1.6rem;
    }
    p {
      font-size: 11px;
      color: #555;
      margin-bottom: 1.5rem;
    }
    a {
      color: #007bff;
      font-size: 11px;
    }
  `;

  render() {
    return html`
      <h2>${t("notFoundTitle")}</h2>
      <p>${t("notFoundMessage")}</p>
      <a href="/">${t("notFoundLink")}</a>
    `;
  }
}

customElements.define("not-found-view", NotFoundView);
