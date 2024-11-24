'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function EditTemplate({ params }) {
  const router = useRouter()
  const [template, setTemplate] = useState({
    name: '',
    html: '',
  })

  useEffect(() => {
    const fetchTemplate = async () => {
        const { id } = await params
      const response = await fetch(`/api/get-template?id=${encodeURIComponent(id)}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data)
      } else {
        console.error('Failed to fetch template')
      }
    }
    fetchTemplate()
  }, [params])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTemplate((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/save-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })

    if (response.ok) {
      router.push('/templates')
    } else {
      console.error('Failed to update template')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Template</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            name="name"
            value={template.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="html">HTML Template</Label>
          <Textarea
            id="html"
            name="html"
            value={template.html}
            onChange={handleInputChange}
            rows={10}
            required
          />
        </div>
        <Button type="submit">Update Template</Button>
      </form>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Preview</h2>
        <div className="bg-white p-4 border rounded-md" style={{ width: '210mm', height: '297mm' }}>
          <div dangerouslySetInnerHTML={{ __html: template.html }} />
        </div>
      </div>
    </div>
  )
}

