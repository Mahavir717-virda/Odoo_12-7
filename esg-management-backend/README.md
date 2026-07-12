# ESG Management Backend Foundation

A production-ready, clean architecture backend foundation built with Node.js, Express.js, and MongoDB using Mongoose.

## Folder Structure

```
esg-management-backend/
├── src/
│   ├── app.js               # Express application initialization & middleware config
│   ├── server.js            # Main server startup & connection logic
│   ├── config/              # Centralized environment, database, mail, & logging setups
│   ├── middleware/          # Express global middlewares (auth, validation, errors, files)
│   ├── routes/              # Central route registers & health probes
│   └── utils/               # Common helper classes (API answers, custom errors, async handlers)
```

## Prerequisites

- Node.js (v18+)
- MongoDB running locally or a cloud database URL

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   Copy `.env.example` to `.env` and fill in the parameters:
   ```bash
   cp .env.example .env
   ```

3. Run in Development Mode:
   ```bash
   npm run dev
   ```

4. Run in Production Mode:
   ```bash
   npm start
   ```

## Scripts

- `npm start`: Starts server in production mode
- `npm run dev`: Starts development server with Nodemon (auto-reloading)
- `npm run lint`: Runs ESLint check across source files
- `npm test`: Runs test suite (to be implemented)
