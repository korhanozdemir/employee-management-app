import { LitElement, html, css } from "lit";
import { t } from "../localization/localization.js"; // Import t

class ConfirmationModal extends LitElement {
  static properties = {
    message: { type: String },
    confirmLabel: { type: String },
    cancelLabel: { type: String },
  };

  constructor() {
    super();
    this.message = t("confirmGeneric");
    this.confirmLabel = t("proceed");
    this.cancelLabel = t("cancel");
  }

  static styles = css`
    :host {
      display: block;
      font-size: 14px;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal {
      background-color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title {
      font-size: 1.4rem;
      font-weight: 500;
      color: var(--primary-color);
      text-align: left;
      flex-grow: 1;
    }
    .close-button {
      background: none;
      border: none;
      font-size: 2.5rem;
      font-weight: 300;
      color: var(--primary-color);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      width: auto;
    }
    .modal p {
      margin-block: 1rem;
      font-size: 1rem;
      color: #333;
      line-height: 1.4;
      text-align: left;
    }
    .buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    button {
      padding: 0.7rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: opacity 0.2s;
      width: 100%;
      box-sizing: border-box;
      border: none;
    }
    button:hover {
      opacity: 0.8;
    }
    .confirm-btn {
      background-color: var(--primary-color);
      color: white;
    }
    .cancel-btn {
      background-color: white;
      color: #525199;
      border: 1px solid #525199;
    }
  `;

  _handleConfirm() {
    this.dispatchEvent(new CustomEvent("confirm"));
  }

  _handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  render() {
    const title = t("confirmTitle", null) || t("confirmGeneric");

    return html`
      <div class="overlay" @click=${this._handleCancel}>
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">${title}</span>
            <button
              class="close-button"
              @click=${this._handleCancel}
              title="${t("close") || "Close"}"
            >
              &times;
            </button>
          </div>
          <p>${this.message}</p>
          <div class="buttons">
            <button class="confirm-btn" @click=${this._handleConfirm}>
              ${this.confirmLabel}
            </button>
            <button class="cancel-btn" @click=${this._handleCancel}>
              ${this.cancelLabel}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("confirmation-modal", ConfirmationModal);
