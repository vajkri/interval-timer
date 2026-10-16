import type { ComponentProps } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'round'

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
