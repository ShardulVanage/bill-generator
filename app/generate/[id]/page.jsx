'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import React from 'react'

export default function GenerateBill({ params }) {
  const BOOKING_FEE = 7.75;
  const router = useRouter()
  const [template, setTemplate] = useState('')
  const [formData, setFormData] = useState({
    customerName: 'Chaitanya',
    amount: '',
    date: '',
    invoiceNumber: '',
    bookingFee: BOOKING_FEE.toFixed(2),
    totalAmount: ''
  })
  const printPreviewRef = useRef(null)
  const previewRef = useRef(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      const { id } = await params
      const response = await fetch(`/api/get-template?id=${encodeURIComponent(id)}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.html)
      } else {
        console.error('Failed to fetch template')
      }
    }
    fetchTemplate()
  }, [params])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'amount') {
      const numericAmount = parseFloat(value) || 0
      const totalAmount = (numericAmount + BOOKING_FEE).toFixed(2)
      
      setFormData(prev => ({
        ...prev,
        amount: value,
        bookingFee: BOOKING_FEE.toFixed(2),
        totalAmount: totalAmount
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const generatePDF = async () => {
    try {
      const element = previewRef.current
      
      if (!element) {
        console.error('Preview element not found')
        return
      }

      const tempContainer = document.createElement('div')
      tempContainer.style.width = '210mm'
      tempContainer.style.background = 'white'
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.innerHTML = element.innerHTML
      document.body.appendChild(tempContainer)

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      document.body.removeChild(tempContainer)

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save('bill.pdf')

    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handlePrintPreview = () => {
    const printWindow = window.open('', 'PRINT', 'height=600,width=800')
    
    let renderedTemplate = template
    Object.entries(formData).forEach(([key, value]) => {
      renderedTemplate = renderedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
    })

    printWindow.document.write('<html><head><title>Print Preview</title>')
    printWindow.document.write('<style>')
    printWindow.document.write(`
      body { 
        font-family: Arial, sans-serif; 
        margin: 20px; 
        max-width: 800px; 
        margin: 0 auto; 
      }
    `)
    printWindow.document.write('</style>')
    printWindow.document.write('</head><body>')
    printWindow.document.write(renderedTemplate)
    printWindow.document.write('</body></html>')
    
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="container mx-auto p-4 flex">
      <div className="w-1/2 pr-4">
        <h1 className="text-3xl font-bold mb-6">Generate Bill</h1>
        <form className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="bookingFee">Booking Fee</Label>
            <Input
              id="bookingFee"
              name="bookingFee"
              type="number"
              value={formData.bookingFee}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              type="text"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex space-x-2">
            <Button type="button" onClick={generatePDF}>Generate PDF</Button>
            <Button type="button" onClick={handlePrintPreview}>Print Preview</Button>
          </div>
        </form>
      </div>
      <div className="w-1/2 pl-4 border-l">
        <h2 className="text-2xl font-bold mb-4">Preview</h2>
        <div 
          ref={previewRef}
          className="bg-white p-4 border rounded-md overflow-auto" 
          style={{ width: '210mm', height: '297mm', maxHeight: '600px' }}
        >
          <div 
            dangerouslySetInnerHTML={{ 
              __html: template.replace(/{{(\w+)}}/g, (_, key) => formData[key] || `{{${key}}}`) 
            }} 
          />
        </div>
      </div>
    </div>
  )
}