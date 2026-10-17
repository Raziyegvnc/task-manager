# Task Manager

A full-stack task management application built with React, Node.js, Express, and MongoDB.

## Features

- User registration and login
- JWT-based authentication
- Secure, user-specific task management
- Create, view, edit, and delete tasks
- Mark tasks as completed or active
- Filter tasks by completion status
- Set task priorities: low, medium, and high
- Responsive user interface

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt

## Project Structure

- `client/` — React frontend
- `server/` — Express API, routes, models, and authentication middleware

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd task-manager
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the example values with your own configuration. Never commit your `.env` file or real secrets to GitHub.

Start the backend:

```bash
npm run dev
```

Use the start command defined in `server/package.json` if it differs.

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Authentication and Data Security

The application uses JWT authentication to protect task routes. Tasks are associated with their owners, so users can access and manage only their own tasks.

## Future Improvements

- Task due dates and reminders
- Search and advanced filtering
- Deployment
