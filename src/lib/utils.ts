import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function now(): string {
  return new Date().toISOString()
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy', { locale: es })
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy HH:mm', { locale: es })
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es })
}
