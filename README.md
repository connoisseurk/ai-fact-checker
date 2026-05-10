# AI Powered Fact Checker

AI-powered web application that extracts factual claims from PDF documents and verifies them using live web context and Large Language Models.

## Features

- Upload PDF documents
- Automatic factual claim extraction
- AI-powered fact verification
- Live web context verification
- Categorization:
  - Verified
  - False
  - Inaccurate
- Modern responsive UI
- Dynamic PDF parsing support

## Tech Stack

### Frontend
- React.js
- CSS
- Vite

### Backend
- Node.js
- Express.js
- OpenRouter API
- Serper API
- pdf-parse
- pdf2json

## Workflow

PDF Upload → Text Extraction → Claim Extraction → Web Search → AI Verification → Structured Results

## Installation

### Backend

```bash
cd backend
npm install
npm start
Frontend
cd frontend
npm install
npm run dev
Environment Variables

Create a .env file inside the backend folder:

OPENROUTER_API_KEY=your_api_key

SERPER_API_KEY=your_api_key

Future Improvements
OCR support for scanned PDFs
Multi-language support
Confidence score for claims
Exportable verification reports
Authentication system

Author

Sudhanshu Pandey