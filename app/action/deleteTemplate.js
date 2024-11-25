    'use server'

import { promises as fs } from 'fs'
import path from 'path'

export async function deleteTemplate(templateName) {
  const templatesDir = path.join(process.cwd(), 'app', 'templates', 'html')
  const templatePath = path.join(templatesDir, templateName)

  try {
    await fs.unlink(templatePath)
    return { success: true, message: 'Template deleted successfully' }
  } catch (error) {
    console.error('Failed to delete template:', error)
    return { success: false, message: 'Failed to delete template' }
  }
}

