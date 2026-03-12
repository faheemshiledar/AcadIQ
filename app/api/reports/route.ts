import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient()
    const { searchParams } = new URL(req.url)
    const module = searchParams.get('module')
    const search = searchParams.get('search')

    let query = db.from('reports').select('*').order('created_at', { ascending: false })
    if (module && module !== 'all') query = query.eq('module', module)
    if (search) query = query.ilike('student_name', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ reports: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const db = getServiceClient()
    const { error } = await db.from('reports').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
