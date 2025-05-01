import { LitElement, html, css } from "lit";
import { Router } from "@vaadin/router";

import "./nav-menu.js"; // Import the navigation menu

// Dynamic imports for route components are handled within router config

class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 1200px; /* Limit max width for larger screens */
      margin: 0 auto; /* Center the content */
      padding: 1rem;
      font-family: sans-serif;
    }

    header {
      background-color: #f0f0f0;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    main {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      min-height: 300px; /* Give some initial height */
    }

    footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.9em;
      color: #666;
    }

    /* Basic responsive adjustments */
    @media (max-width: 600px) {
      header {
        flex-direction: column;
        align-items: flex-start;
      }

      nav-menu {
        margin-top: 0.5rem;
        width: 100%; /* Make nav take full width */
      }

      nav-menu > nav {
        /* Target inner nav element */
        justify-content: space-around; /* Space out links */
      }
    }
  `;

  firstUpdated() {
    const outlet = this.shadowRoot.getElementById("outlet");
    if (outlet) {
      const router = new Router(outlet);
      router.setRoutes([
        { path: "/", redirect: "/employees" }, // Redirect root to employee list
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
    } else {
      console.error("Router outlet element not found!");
    }
  }

  render() {
    return html`
      <header>
        <h1>Employee Management</h1>
        <nav-menu></nav-menu>
      </header>

      <main id="outlet">
        <!-- Router will render components here -->
      </main>

      <footer>
        <p>© 2024 Employee App</p>
      </footer>
    `;
  }
}

customElements.define("app-shell", AppShell);
