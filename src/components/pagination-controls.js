import { LitElement, html, css } from "lit";
import { map } from "lit/directives/map.js";
import { t } from "../localization/localization.js";

class PaginationControls extends LitElement {
  static properties = {
    currentPage: { type: Number },
    totalPages: { type: Number },
  };

  constructor() {
    super();
    this.currentPage = 1;
    this.totalPages = 1;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
      padding: 1rem 0;
      user-select: none;
      font-size: 11px;
    }
    button,
    .page-number {
      background-color: #fff;
      border: 1px solid #ddd;
      color: var(--primary-color);
      padding: 0.5rem 1rem;
      margin: 0 0.25rem;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s, border-color 0.2s;
      font-weight: 500;
      min-width: 40px;
      text-align: center;
      font-size: inherit;
    }
    button:hover:not(:disabled),
    .page-number:hover {
      background-color: var(--secondary-color);
      border-color: var(--secondary-color);
      color: #fff;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: #aaa;
      background-color: #f5f5f5;
    }
    span {
      margin: 0 1rem;
      font-weight: 500;
      color: #555;
    }
    .page-number.active {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      cursor: default;
    }
    .ellipsis {
      padding: 0.5rem 0.5rem;
      color: #aaa;
      cursor: default;
      border: none;
      background: none;
      font-size: inherit;
    }
  `;

  _getPageNumbers() {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;
    const range = [];

    if (total <= 1) return [];

    range.push(1);

    if (current > delta + 2) {
      range.push("...");
    }

    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (current < total - delta - 1) {
      range.push("...");
    }

    if (total > 1) {
      range.push(total);
    }

    return [...new Set(range)];
  }

  _goToPage(pageNumber) {
    if (
      pageNumber >= 1 &&
      pageNumber <= this.totalPages &&
      pageNumber !== this.currentPage
    ) {
      this.dispatchEvent(
        new CustomEvent("page-change", {
          detail: { page: pageNumber },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  _goToPrevPage() {
    this._goToPage(this.currentPage - 1);
  }

  _goToNextPage() {
    this._goToPage(this.currentPage + 1);
  }

  render() {
    if (this.totalPages <= 1) {
      return html``;
    }

    const pageNumbers = this._getPageNumbers();

    return html`
      <button
        @click=${this._goToPrevPage}
        ?disabled=${this.currentPage === 1}
        title=${t("previousPage")}
      >
        &lt;
      </button>

      ${map(pageNumbers, (page) =>
        page === "..."
          ? html`<span class="ellipsis">...</span>`
          : html`
              <button
                class="page-number ${this.currentPage === page ? "active" : ""}"
                @click=${() => this._goToPage(page)}
                ?disabled=${this.currentPage === page}
              >
                ${page}
              </button>
            `
      )}

      <button
        @click=${this._goToNextPage}
        ?disabled=${this.currentPage === this.totalPages}
        title=${t("nextPage")}
      >
        &gt;
      </button>
    `;
  }
}

customElements.define("pagination-controls", PaginationControls);
