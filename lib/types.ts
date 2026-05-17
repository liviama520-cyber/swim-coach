export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'IM'
export type PoolType = 'SCY' | 'LCM' | 'SCM'

export interface TrainingSet {
  reps: number
  distance: number
  stroke: Stroke
  times: number[] // seconds
}

export interface TrainingSession {
  id: string
  date: string
  sets: TrainingSet[]
  notes?: string
}

export interface RaceResult {
  id: string
  date: string
  meet: string
  event: string       // e.g. "100 Freestyle"
  distance: number
  stroke: Stroke
  poolType: PoolType
  time: number        // seconds
  splits: number[]    // seconds per split
  notes?: string
}
