import { useCallback, useEffect, useState } from 'react'

function readValue(key, initialValue) {
  if (typeof window === 'undefined') {
    return typeof initialValue === 'function' ? initialValue() : initialValue
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
    return JSON.parse(raw)
  } catch (err) {
    return typeof initialValue === 'function' ? initialValue() : initialValue
  }
}

/**
 * useState that persists to localStorage and stays in sync across tabs.
 * @param {string} key - storage key
 * @param {*} initialValue - value (or lazy factory) used when nothing is stored
 * @returns {[value, setValue]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue))

  // Persist on change.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      // Quota exceeded or unavailable storage: fail silently.
    }
  }, [key, value])

  // Sync across tabs via the storage event.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key) return
      try {
        setValue(event.newValue === null ? initialValue : JSON.parse(event.newValue))
      } catch (err) {
        // Ignore malformed values from other tabs.
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, initialValue])

  // setValue accepts a direct value or an updater function.
  const setStoredValue = useCallback(
    (updater) => {
      setValue((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      )
    },
    []
  )

  return [value, setStoredValue]
}
