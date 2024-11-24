import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template}>
              <CardHeader>
                <CardTitle>{template.replace('.html', '')}</CardTitle>
                <CardDescription>HTML Template</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href={`/templates/edit/${encodeURIComponent(template)}`} passHref>
                  <Button variant="outline" className="mr-2">Edit</Button>
                </Link>
                <Link href={`/generate/${encodeURIComponent(template)}`} passHref>
                  <Button>Generate Bill</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p>No templates found. Create a new template to get started.</p>
      )}
      <div className="mt-8">
        <Link href="/templates/create" passHref>
          <Button>Create New Template</Button>
        </Link>
      </div>
    </div>
  )
}

