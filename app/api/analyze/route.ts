import { NextRequest, NextResponse } from 'next/server'
import { callGroq } from '@/lib/groq'
import { getAnalysisSystemPrompt } from '@/lib/prompts'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { module, role, data } = await req.json()
    const systemPrompt = getAnalysisSystemPrompt(module, role)
    const userPrompt = `Analyze this student data for the ${module.toUpperCase()} module (${role} view):\n\n${JSON.stringify(data, null, 2)}\n\nBe specific, analytical, and realistic.`

    const raw = await callGroq([{ role: 'user', content: userPrompt }], systemPrompt, true)
    const result = JSON.parse(raw)

    // Save to Supabase
    try {
      const db = getServiceClient()
      const riskLevel = result.academicRiskLevel || result.riskFlag || null
      const readinessScore = result.jobReadinessScore?.total || result.overallReadinessScore || null
      const studentName = data.studentName || data.name || 'Unknown'
      const rollNumber = data.rollNumber || null

      await db.from('reports').insert({
        student_name: studentName,
        roll_number: rollNumber,
        module,
        input_data: data,
        result_data: result,
        risk_level: riskLevel,
        readiness_score: readinessScore,
      })
    } catch (dbErr) {
      console.warn('DB save failed (non-fatal):', dbErr)
    }

    return NextResponse.json({ result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
