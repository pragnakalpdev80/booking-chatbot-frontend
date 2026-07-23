# Calendar Chatbot - Frontend

This is the frontend application for the AI-powered Calendar Booking Chatbot. It provides the user interface for anonymous chat-based appointment scheduling and the admin dashboard for managing provider settings.

## 🚀 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Linting**: Oxlint (High-performance linter)
- **Formatting**: Prettier
- **Git Hooks**: Husky & `lint-staged`
- **Security Scanners**: Semgrep, npm audit, GitHub CodeQL

---

## ⚙️ Local Setup

### 1. Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### 2. Installation

Clone the repository and install the dependencies:

```bash
# Navigate to the frontend directory
cd booking-chatbot-frontend

# Install all Node modules and setup Husky git hooks
npm install
```

### 3. Environment Variables

If your application connects to a backend API, create a `.env` file in the root of the `frontend` directory (you can copy `.env.example` if it exists) and specify your backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

_(Adjust the URL based on where your Django backend is running)._

### 4. Running the Development Server

Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified in your terminal).

---

## 🛠️ Available Scripts

| Command | Description |
| :-- | :-- |
| `npm run dev` | Starts the local Vite development server. |
| `npm run build` | Bundles the application for production into the `dist/` folder. |
| `npm run preview` | Boots up a local static web server to preview your production `dist/` build. |
| `npm run lint` | Runs `oxlint` to quickly scan your codebase for syntax errors and React anti-patterns. |

---

## 🛡️ Code Quality & Security Pipeline (CI/CD)

This repository is equipped with an enterprise-grade quality gate to prevent bad code or security vulnerabilities from being merged.

### Local Automation (Husky)

When you commit or push code, Husky will automatically intercept Git to perform the following checks:

1. **Pre-commit Hook**:
   - Runs `lint-staged`, which executes **Prettier** to auto-format your changed files (`.js`, `.jsx`, `.css`, etc.).
   - Runs **Oxlint** to catch potential bugs and enforce best practices.
   - _If any of these fail, the commit is aborted._

2. **Pre-push Hook**:
   - Runs `npm audit` to verify none of your `package.json` dependencies contain known security vulnerabilities.
   - Runs `semgrep` (using the Python binary from the backend's virtual environment) to scan your React code for XSS or hardcoded secrets.
   - _If vulnerabilities are found, the push is aborted._

### Remote Automation (GitHub Actions)

- **CodeQL**: On every push to the `main` branch or on any Pull Request, GitHub Actions will trigger CodeQL to perform deep semantic security scanning on the codebase.

---

## 📂 Project Structure

```text
frontend/
├── .github/workflows/    # CI/CD GitHub Actions pipelines
├── .husky/               # Local Git hooks (pre-commit, pre-push)
├── public/               # Static assets
├── src/
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers (e.g. AuthContext)
│   ├── pages/            # Page-level components (AdminDashboard, Chatbot)
│   ├── App.jsx           # Root application component
│   ├── index.css         # Global CSS styles
│   └── main.jsx          # React DOM entry point
├── .prettierrc           # Prettier formatting rules
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```
