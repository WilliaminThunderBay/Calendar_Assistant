# AI Calendar & Office Operations Assistant

A React + TypeScript productivity prototype that combines calendar/task coordination, team collaboration, file organization, activity tracking, and an AI assistant powered by Gemini.

This project demonstrates how AI can support day-to-day office operations by turning natural-language requests into structured tasks, helping summarize team communication, and centralizing scheduling and operational information.

## Key Features

- **Calendar and task coordination** - create, update, filter, and track operational tasks by date, staff member, service, region, status, and notes.
- **AI scheduling assistant** - interprets natural-language requests, answers schedule questions, and can extract structured task details.
- **AI daily summaries** - converts team chat history into concise task summaries with confirmed items, pending items, and important notices.
- **Collaboration workspace** - team chat, comments, activity history, user roles, sharing controls, and online-user views.
- **Office file organization** - upload files and organize them into folders for shared operational reference.
- **Operational audit trail** - records task creation, updates, comments, and deletions for better visibility and follow-through.
- **Responsive web interface** - designed as a practical internal operations tool rather than a standalone AI demo.

## Technology

- React
- TypeScript
- Vite
- Gemini 2.5 Flash via `@google/genai`
- Local browser storage for prototype persistence

## Why This Project Matters

The prototype is focused on practical productivity: keeping schedules organized, making responsibilities visible, reducing repetitive coordination work, and using AI to turn unstructured requests and conversations into actionable information.

## Run Locally

**Prerequisites:** Node.js and a Gemini API key.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your Gemini API key to the local environment.
3. Start the development server:
   ```bash
   npm run dev
   ```

## Portfolio Note

This is an independent portfolio prototype using sample operational data. It is intended to demonstrate workflow design, AI-assisted coordination, and internal productivity concepts.
