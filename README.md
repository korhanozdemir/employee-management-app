# Employee Management Application

A simple web application for managing employee records, built with Lit and Vite.

## Technologies Used

- **Frontend Framework:** [Lit](https://lit.dev/) (Simple, fast web components)
- **Build Tool & Dev Server:** [Vite](https://vitejs.dev/)
- **Routing:** [Vaadin Router](https://vaadin.com/router) (Client-side router)
- **Testing:** [Vitest](https://vitest.dev/) (Test runner) with [jsdom](https://github.com/jsdom/jsdom) environment
- **Styling:** Component-scoped CSS with CSS Variables for theming
- **State Management:** Simple custom in-memory store (`src/state/store.js`)
- **Localization:** Basic i18n support (`src/localization/localization.js`)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/korhanozdemir/employee-management-app.git
    cd employee-management-app
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd employee-management-app
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
    _(Use `yarn install` or `pnpm install` if you prefer those package managers)_

## Running the Application

To start the development server:

```bash
npm run dev
```

This will typically start the application on `http://localhost:5173`. Open this URL in your web browser.

## Running Tests

The project uses Vitest for unit testing.

- **Run tests once:**
  ```bash
  npm test
  ```
- **Run tests in watch mode (re-runs on file changes):**
  ```bash
  npm run test:watch
  ```
- **Run tests and generate a coverage report:**
  ```bash
  npm run test:coverage
  ```
  _(Coverage report will be generated in the `coverage/` directory)_

## Project Structure

- `public/`: Static assets (icons, etc.).
- `src/`: Main source code.
  - `components/`: Reusable LitElement web components.
  - `locales/`: Translation files (e.g., `en.json`).
  - `localization/`: Localization helper module.
  - `state/`: Simple state management store.
- `index.html`: Main HTML entry point.
- `package.json`: Project metadata and dependencies.
- `vite.config.js`: Vite configuration
- `vitest.config.js`: Vitest configuration
