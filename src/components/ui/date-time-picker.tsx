'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type DateTimePickerProps = {
  date: Date | undefined
  onDateTimeChange: (date: Date) => void
  onClose?: () => void
}

export function DateTimePicker({ date, onDateTimeChange, onClose }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = useState(() => {
    if (date) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return '09:00'
  })

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return
    
    // Parse time from input
    const [hours, minutes] = timeValue.split(':').map(Number)
    
    // Create new date with selected date and time
    const dateTime = new Date(newDate)
    dateTime.setHours(hours, minutes, 0, 0)
    
    setSelectedDate(dateTime)
    onDateTimeChange(dateTime)
    onClose?.()
  }

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    
    if (selectedDate) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours, minutes, 0, 0)
      
      setSelectedDate(dateTime)
      onDateTimeChange(dateTime)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="border-b px-3 pb-3">
        <Label htmlFor="time-input" className="text-xs font-medium">
          Heure
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Clock size={16} aria-hidden="true" />
          </div>
          <Input
            id="time-input"
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="peer appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          className="bg-transparent p-0"
        />
      </CardContent>
    </Card>
  )
}
