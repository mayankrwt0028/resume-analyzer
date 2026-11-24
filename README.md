
# AI Resume Analyzer

A simple AI-powered resume analyzer that reviews resume content and PDF layout to provide scores and feedback.

## Tech Stack
- React.js + Vite
- Node.js + Express.js
- Qwen 2.5 3B Instruct
- Ollama
- PDF Parse
- JavaScript

## Features
- Upload PDF resume
- Extract resume text
- AI-based resume analysis
- PDF layout analysis
- Resume score and improvement feedback

## Prerequisites
- Node.js
- npm
- Ollama

## Setup

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd resume-analyzer
```

### 2. Install Ollama

Download Ollama from:
https://ollama.com/download

### 3. Download AI Model

Run this command:

```bash
ollama pull hf.co/Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M
```

Make sure Ollama is running before starting the backend.

### 4. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 5. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Local URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Ollama: http://localhost:11434

## AI Model
Qwen 2.5 3B Instruct (Q4_K_M), running locally through Ollama.


