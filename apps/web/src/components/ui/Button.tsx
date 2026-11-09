import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import clsx from 'clsx'
import { Icon, type IconName } from './Icon'
import styles from './Button.module.css'

type Variant = 'primary' | 'ghost' | 'quiet' | 'danger'
type Size = 'md' | 'sm'

type Common = { variant?: Variant; size?: Size; icon?: IconName; iconOnly?: boolean }

const cls = (v: Variant, s: Size, iconOnly: boolean | undefined, extra?: string) => clsx(styles.btn, styles[v], styles[s], iconOnly && styles.iconOnly, extra)

export const Button = forwardRef<HTMLButtonElement, Common & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }>(function Button(
  { variant = 'primary', size = 'md', icon, iconOnly, loading, className, children, type = 'button', disabled, ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} className={cls(variant, size, iconOnly, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
    </button>
  )
})

export function ButtonLink({ variant = 'primary', size = 'md', icon, iconOnly, className, children, ...rest }: Common & LinkProps) {
  return (
    <Link className={cls(variant, size, iconOnly, className)} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
    </Link>
  )
}
