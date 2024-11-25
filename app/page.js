import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Particles from '@/components/ui/particles'
import { HyperText } from '@/components/ui/hyper-text'
import { File, FileAxis3D } from 'lucide-react'
import { Footer } from '@/components/Footer'


async function getTemplates() {
  const templatesDir = path.join(process.cwd(), 'app', 'templates', 'html')
  try {
    const files = await fs.readdir(templatesDir)
    return files.filter(file => file.endsWith('.html'))
  } catch (error) {
    console.error('Failed to read templates directory:', error)
    return []
  }
}

export default async function Home() {
  const templates = await getTemplates()
 const color ='#000000'
 // const [color, setColor] = useState("#ffffff");
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary inline-flex items-center">FakeBillGenerator<FileAxis3D/> </span>
            </div>
            <div>
              <Link href="/templates" passHref>
                <Button >Manage Templates</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className=" ">
      <div className="relative flex py-48 max-h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-lg">
      <span>
      <HyperText
       className=" font-mono pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
      text="Expose Corporate Expense Tricks"
    />
      </span>
      <p className='py-8 text-lg pointer-events-none whitespace-pre-wrap font-mono text-gray-500'>You can use this website to expose your companies to generate fake bills to claim fraudulent money.</p>
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color={color}
        refresh
      />
    </div>
      </section>

      {/* Template List */}
      <section className=" ">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 border-l-2 py-12  border-black">
          <h2 className="text-3xl font-bold text-primary mb-6">Available Templates</h2>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template}>
                  <CardHeader>
                    <CardTitle>{template.replace('.html', '')}</CardTitle>
                    <CardDescription>Create Realistic Mock Invoices in Seconds</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href={`/generate/${encodeURIComponent(template)}`} passHref>
                      <Button>Generate Bill</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">No templates found. Please add HTML templates to the app/templates/html folder.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      <Footer/>
    </div>
  )
}

