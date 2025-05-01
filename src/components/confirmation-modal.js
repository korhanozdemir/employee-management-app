import { LitElement, html, css } from "lit";

class ConfirmationModal extends LitElement {
  static properties = {
    message: { type: String }, // Message to display
    confirmLabel: { type: String },
    cancelLabel: { type: String },
  };

  constructor() {
    super();
    this.message = "Are you sure?";
    this.confirmLabel = "Proceed";
    this.cancelLabel = "Cancel";
  }

  static styles = css`
    :host {
      display: block; /* Hidden by default, shown by parent */
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
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      max-width: 500px;
      text-align: center;
    }
    .modal p {
      margin-bottom: 1.5rem;
      font-size: 1.1em;
      color: #333;
    }
    .buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    button {
      padding: 0.7rem 1.5rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      font-size: 1em;
      transition: opacity 0.2s;
    }
    button:hover {
      opacity: 0.8;
    }
    .confirm-btn {
      background-color: var(--primary-color, #ff6200);
      color: white;
    }
    .cancel-btn {
      background-color: #eee;
      color: #333;
      border: 1px solid #ccc;
    }
  `;

  _handleConfirm() {
    this.dispatchEvent(new CustomEvent("confirm"));
  }

  _handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  render() {
    return html`
      <div class="overlay" @click=${this._handleCancel}>
        <!-- Allow closing by clicking overlay -->
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <!-- Prevent overlay click when clicking modal -->
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
