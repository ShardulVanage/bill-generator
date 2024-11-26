'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import React from 'react'
import { Faker, en_IN } from '@faker-js/faker'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MapPin, List ,X ,ArrowBigLeftDash} from 'lucide-react'
import Link from 'next/link'

// Configure faker to use Indian locale
const fakers = new Faker({
  locale: [en_IN],
})

function generateMaharashtraNumberPlate() {
  const rtoCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const randomNumber = (digits) => Math.floor(Math.random() * (10 ** digits)).toString().padStart(digits, '0');
  
  const rto = rtoCodes[Math.floor(Math.random() * rtoCodes.length)];
  const letters = randomLetter() + randomLetter();
  const numbers = randomNumber(4);
  
  return `MH${rto}${letters}${numbers}`;
}

export default function GenerateBill({ params }) {
  const BOOKING_FEE = 7.75;
  const router = useRouter()
  const [template, setTemplate] = useState('')
  const [addresses, setAddresses] = useState({
    pickup: [],
    dropTo: []
  })
  const [currentAddress, setCurrentAddress] = useState({
    pickup: '',
    dropTo: ''
  })
  const [formData, setFormData] = useState({
    customerName: '',
    riderName: '',
    amount: '',
    date: '',
    longDate: '',
    shortDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    paymentTime: '',
    formattedStartTime: '',
    formattedEndTime: '',
    formattedPaymentTime: '',
    invoiceNumber: '',
    bookingFee: BOOKING_FEE.toFixed(2),
    totalAmount: '',
    numberPlate: '',
    pickupAddress: '',
    dropToAddress: ''
  })
  const printPreviewRef = useRef(null)
  const previewRef = useRef(null)

  const saveAddress = (type) => {
    const addressToSave = currentAddress[type].trim()
    if (addressToSave) {
      const updatedAddresses = {
        ...addresses,
        [type]: [...addresses[type], addressToSave]
      }
      setAddresses(updatedAddresses)
      
      // Update form data with the saved address
      setFormData(prev => ({
        ...prev,
        [`${type}Address`]: addressToSave
      }))
      
      // Clear input
      setCurrentAddress(prev => ({
        ...prev,
        [type]: ''
      }))

      // Optional: Save to localStorage for persistence
      localStorage.setItem(`${type}Addresses`, JSON.stringify(updatedAddresses[type]))
    }
  }

  const selectSavedAddress = (type, address) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Address`]: address
    }))
    setCurrentAddress(prev => ({
      ...prev,
      [type]: address
    }))
  }

  // Load saved addresses from localStorage on component mount
  useEffect(() => {
    const savedPickupAddresses = JSON.parse(localStorage.getItem('pickupAddresses') || '[]')
    const savedDropToAddresses = JSON.parse(localStorage.getItem('dropToAddresses') || '[]')
    
    setAddresses({
      pickup: savedPickupAddresses,
      dropTo: savedDropToAddresses
    })
  }, [])

  const generateRandomRiderName = () => {
    const indianSurnames = [
      'Patel', 'Kumar', 'Singh', 'Sharma', 'Verma', 
      'Gupta', 'Reddy', 'Yadav', 'Raj', 'Malhotra',
      'Kapoor', 'Shah', 'Mehta', 'Iyer', 'Nair'
    ]
    
    const firstName = fakers.person.firstName('male')
    const lastName = indianSurnames[Math.floor(Math.random() * indianSurnames.length)]
    const fullName = `${firstName} ${lastName}`
    
    setFormData(prev => ({
      ...prev,
      riderName: fullName
    }))
  }

  const generateRandomNumberPlate = () => {
    const numberPlate = generateMaharashtraNumberPlate();
    setFormData(prev => ({
      ...prev,
      numberPlate
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return { longDate: '', shortDate: '' }

    const date = new Date(dateString)
    
    const longDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const shortDate = date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    })

    return { longDate, shortDate }
  }

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
    } else if (name === 'date') {
      const { longDate, shortDate } = formatDate(value)
      setFormData(prev => ({
        ...prev,
        date: value,
        longDate,
        shortDate
      }))
    } else if (name === 'startTime' || name === 'endTime') {
      const newTimes = name === 'startTime' 
        ? { startTime: value, endTime: formData.endTime }
        : { startTime: formData.startTime, endTime: value }

      const { duration, paymentTime, formattedTimes } = calculateTimes(newTimes.startTime, newTimes.endTime)

      setFormData(prev => ({
        ...prev,
        [name]: value,
        duration,
        paymentTime,
        ...formattedTimes
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

  const calculateTimes = (startTime, endTime) => {
    if (!startTime || !endTime) return { duration: '', paymentTime: '', formattedTimes: {} }
  
    let startDate = new Date(`2000-01-01T${startTime}`)
    let endDate = new Date(`2000-01-01T${endTime}`)
  
    if (endDate < startDate) {
      endDate = new Date(`2000-01-02T${endTime}`)
    }
  
    const diff = endDate - startDate
  
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.round((diff % (1000 * 60 * 60)) / (1000 * 60))
    const duration = `${hours}h ${minutes}m`
  
    const paymentDate = new Date(endDate.getTime() + 2 * 60000)
    
    let paymentHours = paymentDate.getHours()
    let paymentMinutes = paymentDate.getMinutes()
    const paymentTime = `${paymentHours.toString().padStart(2, '0')}:${paymentMinutes.toString().padStart(2, '0')}`
  
    const formattedStartTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    const formattedEndTime = new Date(`2000-01-01T${endTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    const formattedPaymentTime = paymentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  
    return {
      duration,
      paymentTime,
      formattedTimes: {
        formattedStartTime,
        formattedEndTime,
        formattedPaymentTime
      }
    }
  }

  return (
    <div className="container mx-auto p-4 flex">
    <div className="w-1/2 pr-4">
     <Link href={'/'}>
     <ArrowBigLeftDash/>
     </Link>
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
        
        <div className="grid grid-cols-3 gap-4">
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
        </div>
        
        <div className="grid grid-cols-3 gap-4">
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
            <Label htmlFor="longDate">Formatted Date (Long)</Label>
            <Input
              id="longDate"
              name="longDate"
              value={formData.longDate}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="shortDate">Formatted Date (Short)</Label>
            <Input
              id="shortDate"
              name="shortDate"
              value={formData.shortDate}
              disabled
            />
          </div>
        </div>

        {/* <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            name="invoiceNumber"
            type="text"
            value={formData.invoiceNumber}
            onChange={handleInputChange}
          />
        </div> */}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="paymentTime">Payment Time (End Time + 2mins)</Label>
            <Input
              id="paymentTime"
              name="paymentTime"
              value={formData.formattedPaymentTime}
              disabled
            />
          </div>
        </div>

        <div>
          <Label htmlFor="riderName">Rider Name</Label>
          <div className="flex space-x-2">
            <Input
              id="riderName"
              name="riderName"
              value={formData.riderName}
              onChange={handleInputChange}
              placeholder="Enter rider name"
            />
            <Button 
              type="button" 
              onClick={generateRandomRiderName}
              className="whitespace-nowrap"
            >
              Generate Name
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="numberPlate">Number Plate</Label>
          <div className="flex space-x-2">
            <Input
              id="numberPlate"
              name="numberPlate"
              value={formData.numberPlate}
              onChange={handleInputChange}
              placeholder="Enter number plate"
            />
            <Button 
              type="button" 
              onClick={generateRandomNumberPlate}
              className="whitespace-nowrap"
            >
              Generate Plate
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="pickupAddress">Pickup Address</Label>
          <div className="relative flex space-x-2">
            <div className="flex-grow relative">
              <Input
                id="pickupAddress"
                name="pickupAddress"
                value={currentAddress.pickup}
                onChange={(e) => setCurrentAddress(prev => ({
                  ...prev, 
                  pickup: e.target.value
                }))}
                placeholder="Enter pickup address"
                className="pr-10"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {addresses.pickup.map((address, index) => (
                    <div key={index} className="flex items-center justify-between pr-2">
                      <DropdownMenuItem 
                        onSelect={() => selectSavedAddress('pickup', address)}
                        className="flex-grow"
                      >
                        {address}
                      </DropdownMenuItem>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          const updatedAddresses = addresses.pickup.filter(a => a !== address)
                          setAddresses(prev => ({
                            ...prev,
                            pickup: updatedAddresses
                          }))
                          localStorage.setItem('pickupAddresses', JSON.stringify(updatedAddresses))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button 
              type="button" 
              onClick={() => saveAddress('pickup')}
              variant="outline"
            >
              Save
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="dropToAddress">Drop-to Address</Label>
          <div className="relative flex space-x-2">
            <div className="flex-grow relative">
              <Input
                id="dropToAddress"
                name="dropToAddress"
                value={currentAddress.dropTo}
                onChange={(e) => setCurrentAddress(prev => ({
                  ...prev, 
                  dropTo: e.target.value
                }))}
                placeholder="Enter drop-to address"
                className="pr-10"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {addresses.dropTo.map((address, index) => (
                    <div key={index} className="flex items-center justify-between pr-2">
                      <DropdownMenuItem 
                        onSelect={() => selectSavedAddress('dropTo', address)}
                        className="flex-grow"
                      >
                        {address}
                      </DropdownMenuItem>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          const updatedAddresses = addresses.dropTo.filter(a => a !== address)
                          setAddresses(prev => ({
                            ...prev,
                            dropTo: updatedAddresses
                          }))
                          localStorage.setItem('dropToAddresses', JSON.stringify(updatedAddresses))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button 
              type="button" 
              onClick={() => saveAddress('dropTo')}
              variant="outline"
            >
              Save
            </Button>
          </div>
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
        className="bg-white p-4 border rounded-md  " 
        // style={{ width: '210mm', height: '297mm', maxHeight: '700px' }}
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

