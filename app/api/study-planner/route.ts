import { NextRequest, NextResponse } from 'next/server'
import { callGroq } from '@/lib/groq'

export const dynamic = 'force-dynamic'

const MAX_PAGES = 8
const MAX_CHARS = 20000

const STUDY_PLANNER_PROMPT = `You are an expert academic study planner AI. Analyze the provided document text and return ONLY valid JSON, no markdown, no extra text.

Return this exact JSON structure:
{
  "documentType": "Chapter Notes" | "Previous Year Paper" | "Study Material" | "Lecture Slides" | "Assignment" | "Other",
  "documentTitle": string,
  "totalTopics": number,
  "estimatedStudyHours": number,
  "topics": [
    {
      "name": string,
      "priority": "High" | "Medium" | "Low",
      "keyConcepts": [string],
      "estimatedHours": number,
      "studyTips": [string],
      "likelyExamQuestions": [string]
    }
  ],
  "overallStrategy": string,
  "dailyPlan": [
    {
      "day": number,
      "focus": string,
      "tasks": [string],
      "hours": number
    }
  ],
  "quickRevisionPoints": [string],
  "warningAreas": [string]
}`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const forcePartial = formData.get('forcePartial') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF and TXT files are supported.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let extractedText = ''
    let numPages = 1

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Dynamically import pdf-parse to avoid Next.js edge runtime issues
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      numPages = pdfData.numpages
      extractedText = pdfData.text

      // Validate size
      if (!forcePartial && (numPages > MAX_PAGES || extractedText.length > MAX_CHARS)) {
        return NextResponse.json({
          error: 'too_large',
          pages: numPages,
          characters: extractedText.length,
          maxPages: MAX_PAGES,
          maxChars: MAX_CHARS,
          message: numPages > MAX_PAGES
            ? `Document too large for AI analysis. Max ${MAX_PAGES} pages allowed.`
            : `Document text too long. Max ${MAX_CHARS.toLocaleString()} characters allowed.`,
        }, { status: 413 })
      }

      // Truncate to first 20k chars if forced partial
      if (forcePartial || extractedText.length > MAX_CHARS) {
        extractedText = extractedText.slice(0, MAX_CHARS)
      }
    } else {
      // TXT file
      extractedText = buffer.toString('utf-8')
      if (!forcePartial && extractedText.length > MAX_CHARS) {
        return NextResponse.json({
          error: 'too_large',
          pages: 1,
          characters: extractedText.length,
          maxPages: MAX_PAGES,
          maxChars: MAX_CHARS,
          message: `Document text too long. Max ${MAX_CHARS.toLocaleString()} characters allowed.`,
        }, { status: 413 })
      }
      if (extractedText.length > MAX_CHARS) {
        extractedText = extractedText.slice(0, MAX_CHARS)
      }
    }

    if (extractedText.trim().length < 100) {
      return NextResponse.json({
        error: 'Document appears to be empty or contains too little text to analyze.',
      }, { status: 400 })
    }

    const userPrompt = `Analyze this academic document and generate a comprehensive study plan.

Document text:
${extractedText}

Return a complete, actionable study plan with topic prioritization, key concepts, daily schedule, and exam preparation tips.`

    const raw = await callGroq(
      [{ role: 'user', content: userPrompt }],
      STUDY_PLANNER_PROMPT,
      true
    )

    const result = JSON.parse(raw)
    return NextResponse.json({ result, pages: numPages, characters: extractedText.length })

  } catch (e: any) {
    console.error('Study planner error:', e)
    return NextResponse.json({ error: e.message || 'Analysis failed' }, { status: 500 })
  }
}
