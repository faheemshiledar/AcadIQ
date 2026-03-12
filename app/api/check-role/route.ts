import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ role: 'student' })

    const db = getServiceClient()
    const { data, error } = await db
      .from('admin_users')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (error) {
      console.error('check-role error:', error)
      return NextResponse.json({ role: 'student' })
    }

    const role = data ? 'admin' : 'student'
    return NextResponse.json({ role })
  } catch (e: any) {
    return NextResponse.json({ role: 'student' })
  }
}
