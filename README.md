# dev-dashboard 📊

A full-stack project management dashboard built with **NestJS**, **MySQL**, and vanilla **HTML/CSS/JS**.

![Dashboard Preview](./preview.png)

## ✨ Features

- 📁 Project management with progress tracking
- ✅ Task management
- 👥 Team member overview
- 💰 Revenue stats
- 📈 Activity chart
- 🔐 JWT Authentication

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript |
| Database | MySQL + TypeORM |
| Frontend | HTML / CSS / JavaScript |
| Auth | JWT |

## 📁 Project Structure

```
dev-dashboard/
├── backend/                # NestJS API
│   └── src/
│       ├── projects/
│       ├── tasks/
│       ├── team/
│       ├── stats/
│       └── auth/
└── frontend/               # Static frontend
    ├── index.html
    ├── dashboard.js
    └── style.css
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MySQL >= 8
- npm

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=dev_dashboard
JWT_SECRET=your_jwt_secret
```

```bash
npm run start:dev
```

API runs on `http://localhost:3000`

### Frontend Setup

Just open `frontend/index.html` with Live Server or any static server.

## 📡 API Endpoints

```
GET    /api/stats         → Dashboard stats (projects, tasks, team, revenue)
GET    /api/projects      → List all projects
POST   /api/projects      → Create new project
GET    /api/tasks         → List all tasks
POST   /api/tasks         → Create new task
POST   /api/auth/login    → Login
POST   /api/auth/register → Register
```

## 🤝 Contributing

Pull requests are welcome!

## 📄 License

MIT
