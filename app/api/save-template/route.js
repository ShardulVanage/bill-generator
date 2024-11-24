import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request) {
  const template = await request.json()
  const fileName = `${template.name.toLowerCase().replace(/\s+/g, '-')}.html`
  const templatesDir = path.join(process.cwd(), 'app', 'templates', 'html')
  const filePath = path.join(templatesDir, fileName)

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(templatesDir, { recursive: true })
    
    await fs.writeFile(filePath, template.html)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save template:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

