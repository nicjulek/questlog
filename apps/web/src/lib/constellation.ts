import { hash, seeded } from './random'

export interface Point {
  x: number
  y: number
}

export interface Layout {
  points: Point[]
  edges: [number, number][]
  dust: (Point & { r: number; o: number })[]
}

const cache = new Map<string, Layout>()

export function constellation(seedText: string, count: number, width: number, height: number, pad = 40, dustCount = 0): Layout {
  const key = `${seedText}|${count}|${width}|${height}|${pad}|${dustCount}`
  const hit = cache.get(key)
  if (hit) return hit

  const rand = seeded(hash(seedText))
  const tilt = (rand() - 0.5) * 0.9
  const band = height * (0.42 + rand() * 0.18)
  const inBand = (p: Point) => {
    const cx = width / 2
    const mid = height / 2 + (p.x - cx) * tilt * (height / width)
    return Math.abs(p.y - mid) < band / 2
  }

  const points: Point[] = []
  for (let i = 0; i < count; i++) {
    let best: Point | null = null
    let bestDist = -1
    for (let k = 0; k < 24; k++) {
      const c = { x: pad + rand() * (width - 2 * pad), y: pad + rand() * (height - 2 * pad) }
      if (!inBand(c) && k < 20) continue
      const d = points.reduce((m, p) => Math.min(m, (p.x - c.x) ** 2 + (p.y - c.y) ** 2), Infinity)
      if (d > bestDist) {
        bestDist = d
        best = c
      }
    }
    points.push(best ?? { x: width / 2, y: height / 2 })
  }

  const edges: [number, number][] = []
  if (points.length > 1) {
    const inTree = new Set([0])
    while (inTree.size < points.length) {
      let pick: [number, number] = [0, 0]
      let min = Infinity
      for (const i of inTree) {
        for (let j = 0; j < points.length; j++) {
          if (inTree.has(j)) continue
          const d = (points[i].x - points[j].x) ** 2 + (points[i].y - points[j].y) ** 2
          if (d < min) {
            min = d
            pick = [i, j]
          }
        }
      }
      inTree.add(pick[1])
      edges.push(pick)
    }
  }

  const dust = Array.from({ length: dustCount }, () => ({ x: rand() * width, y: rand() * height, r: 0.4 + rand() * 1.1, o: 0.15 + rand() * 0.4 }))

  const layout = { points, edges, dust }
  cache.set(key, layout)
  return layout
}

export function skyGradient(seedText: string) {
  const rand = seeded(hash(seedText) ^ 0x9e3779b9)
  const h1 = 225 + Math.floor(rand() * 60)
  const h2 = h1 + 20 + Math.floor(rand() * 50)
  return `radial-gradient(120% 90% at ${20 + rand() * 60}% ${rand() * 40}%, hsl(${h2} 55% 32%) 0%, transparent 60%), linear-gradient(160deg, hsl(${h1} 52% 20%) 0%, hsl(${h1 + 10} 48% 11%) 100%)`
}
