import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export function formatTime(time: string): string {
  if (!time) return ''
  
  // Handle time format like "14:30:00" or "14:30"
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

export function formatDateTime(date: string | Date): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}
