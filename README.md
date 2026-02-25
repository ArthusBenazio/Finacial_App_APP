# Financial App Web

Frontend for Financial App using React, Vite, and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create env file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev`: start local server
- `npm run build`: type-check and build production bundle
- `npm run preview`: preview production build

## Initial Scope

- Authentication (register/login/logout)
- Dashboard with account balance overview
- Account creation and deletion
- Account transactions list
- Transaction creation and deletion
- Invite fallback page (`/invite/:token`)

## API

Set `VITE_API_URL` to your backend URL, for example:

`VITE_API_URL=http://localhost:3333`
