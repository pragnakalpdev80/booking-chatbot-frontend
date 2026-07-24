# Frontend Architecture Overview

This document outlines the architecture, state management, and component structure of the Doctor Appointment Chatbot Frontend.

## Tech Stack

- **Framework:** React 19 (`^19.2.7`) with React Router v7.
- **Language:** Standard JavaScript (`.jsx` and `.js`).
- **Styling:** Vanilla CSS (`src/index.css`), without external UI frameworks like Tailwind or MUI.
- **Build/Proxy:** Vite 8, proxying `/api` requests to the Django backend (`http://localhost:8000`).
- **Testing:** Vitest (`^4.1.10`) with React Testing Library and JSDOM.

## Component Structure

The UI is divided primarily between a client-facing Chatbot and an Admin portal.

- **`src/pages/Chatbot.jsx`:** The core conversational UI for users. Initializes a chat session and handles message history.
- **`src/components/ChatMessage.jsx`:** Renders individual messages. Handles raw markdown output from the LLM via `react-markdown`.
- **`src/components/QuickReplyGroup.jsx`:** Detects interactive elements like boolean choices or time ranges (e.g. `10:00 AM – 10:30 AM`) and renders them as clickable, self-disabling buttons.
- **`src/pages/AdminDashboard.jsx` & `src/pages/AdminLogin.jsx`:** Authentication and dashboard views for providers to manage settings and link Google Calendar.

## State Management

- **Local State:** Uses standard React hooks (`useState`, `useEffect`, `useRef`) for ephemeral state like input fields, typing indicators, and UI toggles.
- **Data Fetching:** Direct API interaction via standard `fetch`, connecting to the `/api/v1/` endpoints.

## Quality Assurance & Pre-commit

- The project runs tests automatically on pre-commit utilizing Husky and `lint-staged`.
- Component unit tests are co-located in `src/tests/` and can be run using `npm run test`.
