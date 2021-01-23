import { useState, useEffect } from 'react'

export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return [mounted]
}

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value])
  return debouncedValue
}

export function useTicker(seconds = 1) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000 * seconds)
    return () => clearInterval(timer)
  }, [])
  return [now]
}

export function getDuration(start, end) {
  if (start >= end) return false
  let remaining = parseInt((end - start) / 1000)
  const seconds = `00${remaining % 60}`.slice(-2)
  remaining = (remaining - (remaining % 60)) / 60
  const mins = `00${remaining % 60}`.slice(-2)
  const hours = (remaining - (remaining % 60)) / 60
  if (hours > 72) return `${Math.ceil(hours / 24)} days`
  return `${hours < 10 ? `00${hours}`.slice(-2) : hours}:${mins}:${seconds}`
}
