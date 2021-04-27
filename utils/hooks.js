import { useState, useEffect, useRef } from 'react'

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

export function useThrottle(callback, delay) {
  const [ticker, setTicker] = useState(-1)
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  function tick() {
    if (ticker) clearTimeout(ticker)
    setTicker(setTimeout(() => callback(), delay))
  }

  return [tick]
}

export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}