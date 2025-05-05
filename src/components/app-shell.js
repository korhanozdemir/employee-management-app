import { LitElement, html, css } from "lit";
import { Router } from "@vaadin/router";
import "./nav-menu.js";
import { t } from "../localization/localization.js";

// Dynamic imports for route components are handled within router config

class AppShell extends LitElement {
  static properties = {
    location: { state: true },
  };

  constructor() {
    super();
    this.location = window.location;
    this._router = null;
  }

  static styles = css`
    :host {
      /* Define global theme colors here */
      --primary-color: #ff6200;
      --secondary-color: #ffb587;
      /* Lighter secondary for hover states etc. */
      --secondary-color-light-hover: #fff0e6;
      --grey-color: #6c757d;
      --light-grey-color: #adb5bd;

      display: block;
      margin: 0 auto;
      font-family: sans-serif;
      background-color: var(--app-bg-color, #f8f8f8);
      min-height: 100vh;
      font-size: 14px;
      color: #666;
    }

    header {
      background-color: #fff;
      padding: 0.8rem 3rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: end;
      gap: 0.5rem;
    }

    .logo {
      height: 30px;
      width: auto;
      vertical-align: middle;
    }

    h1 {
      margin: 0;
      color: black;
      line-height: 1;
    }

    main {
      padding: 0;
      border: none;
      min-height: auto;
    }

    footer {
      text-align: center;
      font-size: inherit;
      color: #666;
      padding: 1rem 0;
    }

    @media (max-width: 600px) {
      nav-menu > nav {
        justify-content: space-around;
      }
      header {
        padding: 0.8rem 1rem;
      }
    }
  `;

  firstUpdated() {
    const outlet = this.shadowRoot.getElementById("outlet");
    if (outlet) {
      this._router = new Router(outlet);
      this._router.setRoutes([
        { path: "/", redirect: "/employees" },
        {
          path: "/employees",
          component: "employee-list",
          action: async () => {
            await import("./employee-list.js");
          },
        },
        {
          path: "/add-employee",
          component: "employee-form",
          action: async () => {
            await import("./employee-form.js");
          },
        },
        {
          path: "/edit-employee/:id",
          component: "employee-form",
          action: async () => {
            await import("./employee-form.js");
          },
        },
        // Basic fallback for unknown routes
        {
          path: "(.*)",
          component: "not-found-view",
          action: async () => {
            await import("./not-found-view.js");
          },
        },
      ]);

      // Listen for route changes
      window.addEventListener("vaadin-router-location-changed", (event) => {
        this.location = event.detail.location;
      });
    } else {
      console.error("Router outlet element not found!");
    }
  }

  render() {
    return html`
      <header>
        <div class="header-left">
          <img src="/ING_logo.png" alt="${t("appTitle")} Logo" class="logo" />
          <h1>${t("companyTitle")}</h1>
        </div>
        <nav-menu .location=${this.location}></nav-menu>
      </header>

      <main id="outlet">
        <!-- Router will render components here -->
      </main>

      <footer>
        <p>© ${new Date().getFullYear()}</p>
      </footer>
    `;
  }
}

customElements.define("app-shell", AppShell);
