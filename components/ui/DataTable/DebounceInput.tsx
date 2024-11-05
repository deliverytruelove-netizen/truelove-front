'use client'
import { useEffect, useState } from 'react'

interface Props
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    'onChange'
  > {
  value: string
  onChange: (value: string) => void
}

export const DebounceInput: React.FC<Props> = ({
  value,
  onChange,
  ...props
}) => {
  const [state, setState] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(state)
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [state, onChange])

  return (
    <input
      value={state}
      onChange={(e) => {
        setState(e.target.value)
      }}
      {...props}
    />
  )
}
