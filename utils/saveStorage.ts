export function getLocalStorage<T>(key: string): T | null {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    return null
  }
  
  export function setLocalStorage<T>(key: string, value: T): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
  
  export function removeLocalStorage(key: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  }
  
  