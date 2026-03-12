import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf':                                                          'pdf',
  'text/plain':                                                               'txt',
  'application/msword':                                                       'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':  'docx',
  'application/vnd.ms-powerpoint':                                            'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':'pptx',
  'application/vnd.ms-excel':                                                 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':        'xlsx',
  'image/jpeg':                                                               'jpg',
  'image/png':                                                                'png',
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size is 50 MB.` }, { status: 413 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({
        error: `File type not supported. Allowed: PDF, TXT, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG.`,
      }, { status: 400 })
    }

    // Build a clean filename: timestamp + original name sanitised
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `resources/${Date.now()}_${safeName}`

    const db = getServiceClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage bucket "resources"
    const { data, error } = await db.storage
      .from('resources')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      // Bucket might not exist yet — give a clear message
      if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
        return NextResponse.json({
          error: 'Storage bucket "resources" not found. Please create it in Supabase Storage.',
        }, { status: 500 })
      }
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = db.storage
      .from('resources')
      .getPublicUrl(path)

    return NextResponse.json({
      url:       publicUrl,
      path:      data.path,
      file_name: file.name,
      file_size: file.size,
    })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: e.message || 'Upload failed.' }, { status: 500 })
  }
}
