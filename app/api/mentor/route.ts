import { NextRequest, NextResponse } from 'next/server'
import { callGroq } from '@/lib/groq'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MENTOR_PROMPT = `You are a Personal AI Mentor for engineering students in India. You have access to a student's full history of academic and career reports.

Analyze their progress over time and provide:
1. A focused weekly priority (what to work on THIS week)
2. Top 3-5 priority skills to develop right now
3. A warm, motivating, personalized mentor message (2-3 paragraphs) that references their specific situation

Be specific — mention actual scores, improvements, subject names, skill gaps. Not generic advice.

Return ONLY valid JSON:
{
  "weekly_focus": string,
  "priority_skills": [string],
  "mentor_message": string,
  "progress_summary": {
    "academic_trend": "Improving" | "Stable" | "Declining" | "No Data",
    "career_trend": "Improving" | "Stable" | "Declining" | "No Data",
    "latest_academic_risk": string,
    "latest_career_score": number | null,
    "reports_analyzed": number
  },
  "this_week_tasks": [string],
  "encouragement": string
}`

export async function POST(req: NextRequest) {
  try {
    const { rollNumber, studentName } = await req.json()

    if (!rollNumber && !studentName) {
      return NextResponse.json({ error: 'Roll number or student name required.' }, { status: 400 })
    }

    const db = getServiceClient()

    // Fetch all reports for this student
    let query = db
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (rollNumber) {
      query = query.eq('roll_number', rollNumber)
    } else {
      query = query.ilike('student_name', `%${studentName}%`)
    }

    const { data: reports, error } = await query

    if (error) throw error

    if (!reports || reports.length === 0) {
      return NextResponse.json({
        error: 'No reports found for this student. Please run an Academic or Career analysis first.',
      }, { status: 404 })
    }

    // Separate and sort reports
    const academicReports = reports.filter(r => r.module === 'academic')
    const careerReports   = reports.filter(r => r.module === 'career')

    const latestAcademic = academicReports[0] || null
    const latestCareer   = careerReports[0]   || null

    // Build context for AI
    const context = {
      studentName: reports[0].student_name,
      rollNumber:  reports[0].roll_number,
      totalReports: reports.length,
      academicHistory: academicReports.slice(0, 3).map(r => ({
        date: r.created_at,
        riskLevel: r.risk_level,
        keyData: {
          academicRiskLevel: r.result_data?.academicRiskLevel,
          overallPercentage: r.result_data?.overallPercentage,
          attendanceStatus: r.result_data?.attendanceStatus,
          keyInsights: r.result_data?.keyInsights?.slice(0, 3),
          subjectsNeedingAttention: r.result_data?.subjectsNeedingAttention?.slice(0, 3),
        }
      })),
      careerHistory: careerReports.slice(0, 3).map(r => ({
        date: r.created_at,
        readinessScore: r.readiness_score,
        keyData: {
          totalScore: r.result_data?.jobReadinessScore?.total,
          classification: r.result_data?.competitivePositioning?.classification,
          topSkillGaps: r.result_data?.skillGaps?.slice(0, 3).map((g: any) => g.skill),
          placementProbability: r.result_data?.placementIntelligence?.eligibilityProbability,
        }
      })),
    }

    const userPrompt = `Here is the complete history for student ${context.studentName} (Roll: ${context.rollNumber || 'N/A'}):

ACADEMIC REPORTS (${context.academicHistory.length} total):
${JSON.stringify(context.academicHistory, null, 2)}

CAREER REPORTS (${context.careerHistory.length} total):
${JSON.stringify(context.careerHistory, null, 2)}

Total reports analyzed: ${context.totalReports}

Generate a personalized weekly mentorship response. Reference specific scores, subjects, and skill gaps from their actual data.`

    const raw = await callGroq(
      [{ role: 'user', content: userPrompt }],
      MENTOR_PROMPT,
      true
    )

    const result = JSON.parse(raw)
    return NextResponse.json({
      ...result,
      student_name: context.studentName,
      reports_count: context.totalReports,
    })

  } catch (e: any) {
    console.error('Mentor API error:', e)
    return NextResponse.json({ error: e.message || 'Mentor analysis failed' }, { status: 500 })
  }
}
