'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CreateTemplate() {
  const router = useRouter()
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    html: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTemplate((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Here we would typically save the template to your backend
    // For this example, we'll simulate saving to a file
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
      console.error('Failed to save template')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create Template</h1>
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
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={template.description}
            onChange={handleInputChange}
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
            placeholder="Enter your HTML template here. Use {{variableName}} for dynamic content."
            required
          />
        </div>
        <Button type="submit">Save Template</Button>
      </form>
    </div>
  )
}

