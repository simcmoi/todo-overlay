'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DateTimePickerProps = {
  date: Date | undefined
  onDateTimeChange: (date: Date) => void
  onClose?: () => void
}

function getDateForOffset(daysOffset: number, hour: number = 9, minute: number = 0): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(hour, minute, 0, 0)
  return date
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

  const handleQuickSelect = (daysOffset: number) => {
    const [hours, minutes] = timeValue.split(':').map(Number)
    const date = getDateForOffset(daysOffset, hours, minutes)
    setSelectedDate(date)
    onDateTimeChange(date)
    onClose?.()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="border-b px-3 pb-3 space-y-3">
        <div className="space-y-2">
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
        </div>

        {/* Raccourcis rapides pour les 7 prochains jours */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Raccourcis</Label>
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((offset) => {
              const date = getDateForOffset(offset)
              const isToday = offset === 0
              const isTomorrow = offset === 1
              
              let label = ''
              if (isToday) {
                label = "Auj."
              } else if (isTomorrow) {
                label = 'Demain'
              } else {
                label = date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)
              }
              
              const dayNumber = date.getDate()
              const isSelected = selectedDate && 
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear()

              return (
                <Button
                  key={offset}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-12 flex flex-col items-center justify-center gap-0.5 text-xs px-1",
                    isSelected && "ring-2 ring-ring"
                  )}
                  onClick={() => handleQuickSelect(offset)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleQuickSelect(offset)
                    }
                  }}
                >
                  <span className="text-[10px] font-medium opacity-80">{label}</span>
                  <span className="text-base font-semibold">{dayNumber}</span>
                </Button>
              )
            })}
          </div>
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
