import { LitElement, html, css } from "lit";

class NotFoundView extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      text-align: center;
      color: #dc3545;
    }
    h2 {
      margin-bottom: 1rem;
    }
    a {
      color: #007bff;
    }
  `;

  render() {
    return html`
      <h2>404 - Page Not Found</h2>
      <p>Oops! The page you requested could not be found.</p>
      <a href="/">Go back to the Homepage</a>
    `;
  }
}

customElements.define("not-found-view", NotFoundView);
