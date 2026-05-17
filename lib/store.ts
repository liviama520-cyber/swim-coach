import { TrainingSession, RaceResult } from './types'

const TRAINING_KEY = 'swim_training'
const RACES_KEY = 'swim_races'

export function getSessions(): TrainingSession[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(TRAINING_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveSession(session: TrainingSession) {
  const sessions = getSessions()
  const idx = sessions.findIndex(s => s.id === session.id)
  if (idx >= 0) sessions[idx] = session
  else sessions.unshift(session)
  localStorage.setItem(TRAINING_KEY, JSON.stringify(sessions))
}

export function getRaces(): RaceResult[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(RACES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveRace(race: RaceResult) {
  const races = getRaces()
  const idx = races.findIndex(r => r.id === race.id)
  if (idx >= 0) races[idx] = race
  else races.unshift(race)
  localStorage.setItem(RACES_KEY, JSON.stringify(races))
}

export function deleteRace(id: string) {
  const races = getRaces().filter(r => r.id !== id)
  localStorage.setItem(RACES_KEY, JSON.stringify(races))
}

export function deleteSession(id: string) {
  const sessions = getSessions().filter(s => s.id !== id)
  localStorage.setItem(TRAINING_KEY, JSON.stringify(sessions))
}
