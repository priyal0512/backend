# Term Sheet Validation Dashboard

A professional React dashboard for the AI Term Sheet Validation System.

## Features

- **Dashboard Overview**: Statistics and quick actions
- **File Upload**: Drag-and-drop PDF upload interface
- **Validation Results**: Visual score display and issue tracking
- **Reports Export**: Generate and download validation reports
- **AI Chatbot**: Interactive assistant for term sheet queries
- **User Authentication**: Login and signup functionality

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- React Icons

## Project Structure

```
src/
├── components/
│   ├── features/     # Feature components (FileUpload, Chatbot, etc.)
│   ├── layout/       # Layout components (Header, Sidebar, etc.)
│   └── shared/       # Shared components (LoadingSpinner, ErrorAlert, etc.)
├── context/          # React Context (AuthContext)
├── pages/            # Page components
├── services/         # API service files
├── App.jsx           # Main app component with routing
└── main.jsx          # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
