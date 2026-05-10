require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const pdfParseModule = require('pdf-parse');
const PDFParser = require('pdf2json');

const pdfParse = pdfParseModule.default || pdfParseModule;

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage()
});

async function askAI(prompt) {
    const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.choices[0].message.content;
}

function extractWithPdf2Json(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataError', errData => {
            reject(errData.parserError);
        });

        pdfParser.on('pdfParser_dataReady', pdfData => {
            let text = '';

            pdfData.Pages.forEach(page => {
                page.Texts.forEach(item => {
                    text += decodeURIComponent(item.R[0].T) + ' ';
                });
            });

            resolve(text);
        });

        pdfParser.parseBuffer(buffer);
    });
}

async function extractPdfText(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        return await extractWithPdf2Json(buffer);
    }
}

async function searchWeb(query) {
    try {
        const response = await axios.post(
            'https://google.serper.dev/search',
            { q: query },
            {
                headers: {
                    'X-API-KEY': process.env.SERPER_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.data.organic || response.data.organic.length === 0) {
            return 'No search results found';
        }

        return response.data.organic
            .slice(0, 5)
            .map(item => item.snippet || '')
            .join(' ');
    } catch (error) {
        return 'Search context unavailable';
    }
}

function cleanJson(text) {
    return text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
}

app.post('/api/factcheck', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF uploaded'
            });
        }

        const extractedText = await extractPdfText(req.file.buffer);
        const text = extractedText.substring(0, 8000);

        if (!text || text.trim().length < 20) {
            return res.status(400).json({
                success: false,
                error: 'Could not extract readable text from this PDF'
            });
        }

        const extractionPrompt = `
Extract all important factual claims from the following document.

Rules:
- Extract only factual claims that can be verified.
- Prefer claims containing dates, numbers, places, organizations, scientific facts, technical facts, market facts, or statistics.
- Do not include opinions.
- Return ONLY valid JSON array of strings.
- No markdown.

DOCUMENT:
${text}
`;

        const claimsRaw = await askAI(extractionPrompt);

        let claims = [];

        try {
            claims = JSON.parse(cleanJson(claimsRaw));
        } catch {
            return res.status(500).json({
                success: false,
                error: 'Claim extraction failed',
                raw: claimsRaw
            });
        }

        const finalResults = [];

        for (const claim of claims) {
            const webContext = await searchWeb(claim);

            const verificationPrompt = `
You are a fact-checking agent.

Verify the claim using the provided web context.

CLAIM:
${claim}

WEB CONTEXT:
${webContext}

Return ONLY valid JSON object.

Format:
{
  "claim": "claim text",
  "status": "Verified / False / Inaccurate",
  "explanation": "short explanation",
  "real_fact": "correct information"
}
`;

            const verificationRaw = await askAI(verificationPrompt);

            try {
                finalResults.push(JSON.parse(cleanJson(verificationRaw)));
            } catch {
                finalResults.push({
                    claim,
                    status: 'Inconclusive',
                    explanation: verificationRaw,
                    real_fact: 'Could not parse verification response'
                });
            }
        }

        res.json({
            success: true,
            results: finalResults
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});