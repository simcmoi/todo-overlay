import { type FormEvent, type RefObject, useState } from 'react'
import { Input } from '@/components/ui/input'

type TodoInputProps = {
  inputRef: RefObject<HTMLInputElement | null>
  onCreate: (text: string) => Promise<void>
}

export function TodoInput({ inputRef, onCreate }: TodoInputProps) {
  const [text, setText] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = text.trim()

    if (!trimmed) {
      return
    }

    await onCreate(trimmed)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <Input
        ref={inputRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Ajouter une tâche"
        className="h-10 rounded-md border-border bg-card text-sm"
      />
    </form>
  )
}
