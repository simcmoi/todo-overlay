import { Calendar, X } from 'lucide-react'
import { type FormEvent, type RefObject, useState, useRef } from 'react'
import { format, isToday, isTomorrow, isPast, differenceInDays, differenceInWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type TodoCreateFormProps = {
  inputRef: RefObject<HTMLInputElement | null>
  onCreate: (payload: {
    title: string
    details?: string
    reminderAt?: number
  }) => Promise<void>
}

function formatRelativeDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()

  if (isToday(date)) {
    return 'Aujourd\'hui'
  }

  if (isTomorrow(date)) {
    return 'Demain'
  }

  if (isPast(date)) {
    const days = Math.abs(differenceInDays(now, date))
    const weeks = Math.abs(differenceInWeeks(now, date))

    if (days === 1) {
      return 'Il y a 1 jour'
    }
    if (days < 7) {
      return `Il y a ${days} jours`
    }
    if (weeks === 1) {
      return 'Il y a 1 semaine'
    }
    return `Il y a ${weeks} semaines`
  }

  // Future date
  return format(date, 'EEE d MMM', { locale: fr })
}

function getDateBadgeVariant(timestamp: number): 'default' | 'destructive' | 'secondary' {
  const date = new Date(timestamp)

  if (isToday(date)) {
    return 'default' // bleu
  }

  if (isPast(date)) {
    return 'destructive' // rouge
  }

  return 'secondary' // normal
}

export function TodoCreateForm({ inputRef, onCreate }: TodoCreateFormProps) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined)
  const [reminderTime, setReminderTime] = useState('09:00')
  const detailsInputRef = useRef<HTMLInputElement>(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    const reminderAt = reminderDate
      ? (() => {
          const [hours, minutes] = reminderTime.split(':').map(Number)
          const dateWithTime = new Date(reminderDate)
          dateWithTime.setHours(hours, minutes, 0, 0)
          return dateWithTime.getTime()
        })()
      : undefined

    await onCreate({
      title: trimmedTitle,
      details: details.trim() || undefined,
      reminderAt,
    })

    setTitle('')
    setDetails('')
    setShowDetails(false)
    setReminderDate(undefined)
    setReminderTime('09:00')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-2">
      <Input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void onSubmit(event as any)
          }
        }}
        placeholder="Ajouter une tâche"
        className="h-10 rounded-md border-border bg-card text-sm"
      />

      {(showDetails || details || reminderDate) && (
        <>
          {showDetails && (
            <Input
              ref={detailsInputRef}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Ajouter des détails..."
              className="h-8 text-xs"
            />
          )}

          <div className="flex items-center gap-2">
            {!showDetails && (
              <button
                type="button"
                onClick={() => {
                  setShowDetails(true)
                  setTimeout(() => detailsInputRef.current?.focus(), 0)
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                + Détails
              </button>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-7 gap-1 px-2 text-xs',
                    reminderDate && 'border-transparent',
                  )}
                >
                  {reminderDate ? (
                    <Badge variant={getDateBadgeVariant(reminderDate.getTime())}>
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatRelativeDate(reminderDate.getTime())}
                    </Badge>
                  ) : (
                    <>
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="space-y-3 p-3">
                  <CalendarComponent
                    mode="single"
                    selected={reminderDate}
                    onSelect={setReminderDate}
                    locale={fr}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {reminderDate && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setReminderDate(undefined)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </>
      )}
    </form>
  )
}
