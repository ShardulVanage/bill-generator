import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

  const templatesDir = path.join(process.cwd(), 'app', 'templates', 'html')
  const filePath = path.join(templatesDir, id)

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(templatesDir, { recursive: true })

    const html = await fs.readFile(filePath, 'utf-8')
    return NextResponse.json({ name: id.replace('.html', ''), html })
  } catch (error) {
    console.error('Failed to read template:', error)
    return NextResponse.json({ error: 'Failed to read template' }, { status: 500 })
  }
}

