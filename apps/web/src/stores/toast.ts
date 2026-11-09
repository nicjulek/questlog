import { create } from 'zustand'

type Toast = { id: number; text: string; tone: 'ok' | 'error' }

type State = {
  toasts: Toast[]
  show: (text: string, tone?: Toast['tone']) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useToasts = create<State>((set, get) => ({
  toasts: [],
  show: (text, tone = 'ok') => {
    const id = ++seq
    set({ toasts: [...get().toasts.slice(-2), { id, text, tone }] })
    setTimeout(() => get().dismiss(id), 3200)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) })
}))

export const toast = (text: string, tone?: Toast['tone']) => useToasts.getState().show(text, tone)
