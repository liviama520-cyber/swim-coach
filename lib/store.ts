import { supabase } from './supabase'
import { TrainingSession, RaceResult } from './types'

function toRace(row: Record<string, unknown>): RaceResult {
  return {
    id: row.id as string,
    date: row.date as string,
    meet: row.meet as string,
    event: row.event as string,
    distance: row.distance as number,
    stroke: row.stroke as RaceResult['stroke'],
    poolType: row.pool_type as RaceResult['poolType'],
    time: row.time as number,
    splits: (row.splits as number[]) || [],
    notes: (row.notes as string) || '',
  }
}

function toSession(row: Record<string, unknown>): TrainingSession {
  return {
    id: row.id as string,
    date: row.date as string,
    sets: (row.sets as TrainingSession['sets']) || [],
    notes: (row.notes as string) || '',
  }
}

export async function getRaces(): Promise<RaceResult[]> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(toRace)
}

export async function saveRace(race: RaceResult) {
  const { error } = await supabase.from('races').upsert({
    id: race.id,
    date: race.date,
    meet: race.meet,
    event: race.event,
    distance: race.distance,
    stroke: race.stroke,
    pool_type: race.poolType,
    time: race.time,
    splits: race.splits,
    notes: race.notes,
  })
  if (error) throw error
}

export async function deleteRace(id: string) {
  const { error } = await supabase.from('races').delete().eq('id', id)
  if (error) throw error
}

export async function getSessions(): Promise<TrainingSession[]> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(toSession)
}

export async function saveSession(session: TrainingSession) {
  const { error } = await supabase.from('training_sessions').upsert({
    id: session.id,
    date: session.date,
    sets: session.sets,
    notes: session.notes,
  })
  if (error) throw error
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from('training_sessions').delete().eq('id', id)
  if (error) throw error
}
