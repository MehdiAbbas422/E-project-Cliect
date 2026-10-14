# EventSphere Client

React 18 single-page application built with Vite. It provides the public expo directory, attendee and exhibitor workflows, and the admin dashboard. The client talks to the Express API and uses Socket.IO when a persistent socket server is available.

## Requirements and setup

- Node.js and npm
- The backend running locally for authenticated and API-backed workflows

```powershell
cd client
npm install
npm run dev
```

Vite serves the app at `http://localhost:3000`. Its development proxy forwards `/api` and `/uploads` to `http://localhost:5000`; start the server separately from `server/`.

Optional local settings belong in `client/.env.local`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Full API base URL, including `/api`; unset uses Vite's `/api` proxy locally and the configured production API in production builds. |
| `VITE_SOCKET_URL` | Socket.IO server origin without `/api`. Leave unset for Vercel/serverless deployments, where polling is used. |

`VITE_*` values are compiled into browser assets and are public. Never put passwords, API keys, private tokens, or other secrets in client environment variables.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run build` | Create the production bundle in `dist/`. |
| `npm run preview` | Serve the most recent production bundle locally. |

## Application flow

`src/main.jsx` mounts React, the router, authentication and notification providers, and the global CSS. `src/App.jsx` defines the routes, shared navigation/background/footer, visual hooks, and the not-found page. `Protected` checks authentication and role access before rendering private pages. `AuthContext` stores the signed-in user and JWT in browser storage; `api.js` attaches that JWT to API requests.

The notification context connects the signed-in user to the real-time layer in `socket.js`. `useRealtime` lets pages refresh data when updates arrive. Socket.IO is used during local development or when `VITE_SOCKET_URL` is set. On serverless hosting, the client polls the change-feed and notifications endpoints instead.

## Screens and routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | `Home` | Public home page. |
| `/login`, `/register`, `/forgot-password` | Authentication pages | Sign in, create an account, and reset a password. |
| `/expos` | `Expos` | Search, filter, and browse expos. |
| `/expos/:id` | `ExpoDetail` | Expo details, venue map, agenda, session booking, booths, exhibitors, and announcements. |
| `/exhibitors` | `Exhibitors` | Browse exhibitor profiles. |
| `/dashboard` | `Dashboard` | Admin expo creation and management, floor plan, schedule, announcements, and analytics. |
| `/admin/exhibitors`, `/admin/feedback`, `/admin/users` | Admin pages | Review applications, reply to feedback, and manage accounts. |
| `/exhibitor` | `ExhibitorPortal` | Manage company profile, booth reservation, bookings, and enquiries. |
| `/feedback`, `/my-bookings`, `/my-messages`, `/profile` | Account pages | Submit feedback, manage session bookings and messages, and edit the profile. |

`Protected` restricts the dashboard and admin pages to admins, the exhibitor portal to exhibitors, and account pages to signed-in users.

## Source map

- `src/api.js`: Axios client, API base URL selection, and bearer-token interceptor.
- `src/socket.js`: Socket.IO client and polling fallback for serverless hosting.
- `src/App.jsx`, `src/main.jsx`: route tree and application bootstrap.
- `src/context/`: authentication and notification providers.
- `src/hooks/`: realtime refresh, scroll reveal, parallax, and tilt effects.
- `src/components/`: shared navigation, page hero, protected-route guard, maps, charts, image upload, backdrop, and admin navigation/user controls.
- `src/pages/`: public pages, role-specific workflows, and organizer dashboard.
- `src/pages/admin/`: admin exhibitor, feedback, and user views.
- `src/css/`: design tokens, global layout/components/motion, and page-specific stylesheets.
- `src/assets/`, `src/images.js`: bundled and remotely hosted visual assets.
- `public/`: static files copied unchanged into the production build.
- `index.html`: browser document and Vite entry point.
- `vite.config.js`: React plugin, development port, and local API/image proxies.
- `vercel.json`: production routing/rewrite configuration for the SPA and API deployment.

## Production deployment

Build with `npm run build`; deploy the contents of `dist/` using the configured hosting project. For Vercel, set `VITE_API_URL` in the client project's environment settings before building. Do not set `VITE_SOCKET_URL` when the backend is serverless; polling works without it. See the root deployment guide for the complete client/server deployment sequence.
