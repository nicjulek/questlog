import type { ReactNode } from 'react'
import { Constellation } from '../../components/ui/Constellation'
import { Brand } from '../../app/layouts/Brand'
import styles from './AuthShell.module.css'

const DEMO = Array.from({ length: 14 }, (_, i) => ({ id: i, title: '', secret: false, unlockedAt: i % 3 === 2 ? null : 'x' }))

export function AuthShell({ title, lead, children, footer }: { title: string; lead: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className={styles.page}>
      <section className={styles.art} aria-hidden="true">
        <Constellation seed="Questlog" achievements={DEMO} variant="hero" />
        <p className={styles.tag}>Cada conquista é uma estrela. Cada jogo, uma constelação.</p>
      </section>
      <section className={styles.panel}>
        <Brand to="/entrar" />
        <div className={styles.body}>
          <h1>{title}</h1>
          <p className={styles.lead}>{lead}</p>
          {children}
        </div>
        <p className={styles.footer}>{footer}</p>
      </section>
    </div>
  )
}
