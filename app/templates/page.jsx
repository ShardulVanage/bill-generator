import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteTemplate } from '@/app/action/deleteTemplate'

async function getTemplates() {
  const templatesDir = path.join(process.cwd(), 'app', 'templates', 'html')
  try {
    await fs.mkdir(templatesDir, { recursive: true })
    const files = await fs.readdir(templatesDir)
    return files.filter(file => file.endsWith('.html'))
  } catch (error) {
    console.error('Failed to read templates directory:', error)
    return []
  }
}

export default async function TemplatesPage() {
  const templates = await getTemplates()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Templates</h1>
      <div className="my-4">
        <Link href="/templates/create" passHref>
          <Button>Create New Template</Button>
        </Link>
      </div>  
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template}>
              <CardHeader>
                <CardTitle>{template.replace('.html', '')}</CardTitle>
                <CardDescription>Dont Delete this template by mistake</CardDescription>
              </CardHeader>
              <CardContent className='inline-flex'>
                <Link href={`/templates/edit/${encodeURIComponent(template)}`} passHref>
                  <Button variant="outline" className="mr-2">Edit</Button>
                </Link>
                <Link href={`/generate/${encodeURIComponent(template)}`} passHref>
                  <Button className="mr-2">Generate Bill</Button>
                </Link>
                <form action={deleteTemplate.bind(null, template)}>
                  <Button type="submit" variant="destructive" disabled >Delete</Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No templates found. Create a new template to get started.</p>
      )}
    </div>
  )
}

