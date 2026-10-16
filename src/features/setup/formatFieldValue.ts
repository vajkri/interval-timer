import { formatSeconds, isDurationField, type TimerField } from '@/domain/timer'

export function formatFieldValue(field: TimerField, value: number): string {
  if (isDurationField(field)) return formatSeconds(value)
  return field === 'rounds' ? `${value}×` : String(value)
}
