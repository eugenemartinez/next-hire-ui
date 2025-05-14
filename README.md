# NextHire Frontend

This is the frontend application for NextHire, a modern job board platform. It's built with React, TypeScript, and Vite, focusing on providing a fast, responsive, and user-friendly experience for job seekers and posters.

## ✨ Features

*   **Job Discovery:**
    *   Browse and search for job listings.
    *   Filter jobs by tags, job type, and salary range.
    *   Sort job listings by various criteria (e.g., latest update, title).
    *   Paginated results for easy navigation.
    *   View detailed information for each job posting.
*   **Job Management (for Posters):**
    *   Post new job listings through an intuitive form.
    *   Receive a unique modification code upon job creation to manage the listing.
    *   Edit existing job listings after verifying with the modification code.
    *   Delete job listings after verification.
*   **User Experience:**
    *   Save favorite jobs locally in the browser.
    *   View a dedicated page for saved jobs.
    *   Responsive design for optimal viewing on various devices (desktop, tablet, mobile).
    *   Dark and Light theme support.
    *   Smooth animations and transitions for a polished feel.
    *   User-friendly notifications for actions and errors.
    *   URL synchronization for filters, search, and pagination, allowing for shareable links.
*   **Rich Content:**
    *   Rich text editor (Tiptap) for detailed job descriptions, supporting basic formatting and code blocks.

## 🛠️ Tech Stack

*   **Framework/Library:** React, React Router
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (with Shadcn UI Green Theme as a base)
*   **State Management:** Zustand
*   **Data Fetching/Caching:** TanStack Query (React Query)
*   **Forms:** React Hook Form (with Zod for validation)
*   **Animations:** Framer Motion
*   **Rich Text Editor:** Tiptap

## 🚀 Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   npm, yarn, or pnpm

### Setup

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <https://github.com/eugenemartinez/next-hire-ui>
    cd next-hire-ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `client` directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with the necessary environment variables. The most important one is likely the API base URL:
    ```env
    VITE_API_BASE_URL=https://nexthire-api.vercel.app/ (or use http://127.0.0.1:8000 for local development)
    ```
    (Adjust the URL if your backend server runs on a different port or path).

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running, typically at `http://localhost:5173` (Vite's default) or `http://localhost:3000`.

## 📜 Available Scripts

In the `client` directory, you can run several commands:

*   `npm run dev` or `yarn dev`: Starts the development server with Hot Module Replacement (HMR).
*   `npm run build` or `yarn build`: Builds the application for production to the `dist` folder.
*   `npm run lint` or `yarn lint`: Lints the codebase using ESLint.
*   `npm run preview` or `yarn preview`: Serves the production build locally for previewing.

## 📁 Folder Structure

A brief overview of the `client/src` directory:

```
src/
├── api/          # API client setup, TanStack Query hooks, and endpoint definitions
├── components/   # Reusable UI components (features, forms, layout, ui)
├── pages/        # Page-level components corresponding to routes
├── stores/       # Zustand store definitions for global state management
├── App.tsx       # Main application component, router setup
├── main.tsx      # Entry point of the application
└── index.css     # Main CSS file, Tailwind directives
```

---

This README provides a good starting point. You can expand it further with more details on specific features, contribution guidelines, or deployment instructions as needed.