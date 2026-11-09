import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from './Field.module.css'

type Base = { label: string; error?: string; hint?: ReactNode; className?: string }

function Wrap({ id, label, error, hint, className, children }: Base & { id: string; children: ReactNode }) {
  return (
    <div className={clsx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const aria = (id: string, error?: string, hint?: ReactNode) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined
})

export function TextField({ label, error, hint, className, id, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Wrap id={fid} label={label} error={error} hint={hint} className={className}>
      <input id={fid} className={styles.control} {...aria(fid, error, hint)} {...rest} />
    </Wrap>
  )
}

export function TextArea({ label, error, hint, className, id, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Wrap id={fid} label={label} error={error} hint={hint} className={className}>
      <textarea id={fid} className={clsx(styles.control, styles.area)} {...aria(fid, error, hint)} {...rest} />
    </Wrap>
  )
}

export function SelectField({ label, error, hint, className, id, children, ...rest }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Wrap id={fid} label={label} error={error} hint={hint} className={className}>
      <select id={fid} className={clsx(styles.control, styles.select)} {...aria(fid, error, hint)} {...rest}>
        {children}
      </select>
    </Wrap>
  )
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <p className={styles.formError} role="alert">
      {children}
    </p>
  )
}
