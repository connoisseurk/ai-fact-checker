# AI Powered Fact Checker

AI-powered web application that extracts factual claims from PDF documents and verifies them using live web context and Large Language Models.

## Features

- Upload PDF documents
- Extract factual claims automatically
- Verify claims using AI and live web search
- Categorize claims as Verified, False, or Inaccurate
- Display structured explanations and correct facts
- Modern responsive frontend UI
- Supports dynamic PDF text extraction

## Tech Stack

### Frontend
- React.js
- Vite
- CSS

### Backend
- Node.js
- Express.js
- Multer
- Axios
- pdf-parse
- pdf2json
- OpenRouter API
- Serper API

## Workflow

PDF Upload → Text Extraction → Claim Extraction → Web Search → AI Verification → Structured Results

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
## Environment Variables

Create a .env file inside the backend folder.

```env
OPENROUTER_API_KEY=your_openrouter_api_key
SERPER_API_KEY=your_serper_api_key

```

## Future Improvements

- OCR support for scanned PDFs
- Confidence score for each claim
- Exportable fact-checking report
- Multi-language support
- User authentication

## Author

Sudhanshu Pandey