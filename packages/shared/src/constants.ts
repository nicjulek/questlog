export const GAME_STATUSES = ['playing', 'beaten', 'platinum', 'paused', 'backlog', 'dropped'] as const
export type GameStatus = (typeof GAME_STATUSES)[number]

export const STATUS_LABEL: Record<GameStatus, string> = {
  playing: 'Jogando',
  beaten: 'Zerado',
  platinum: 'Platinado',
  paused: 'Pausado',
  backlog: 'Quero jogar',
  dropped: 'Abandonado'
}

export const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile', 'Outra'] as const
export type Platform = (typeof PLATFORMS)[number]
