import { updateUser, getUser } from './auth.js'

export function bumpStreak() {
  const today = new Date().toDateString()
  updateUser(u => {
    if (u.lastActive === today) return u
    const yest = new Date(Date.now() - 86400000).toDateString()
    return {
      ...u,
      streak: u.lastActive === yest ? (u.streak || 0) + 1 : 1,
      lastActive: today,
    }
  })
}

export function logHeatmap(sessions = 1) {
  const hk = new Date().toISOString().split('T')[0]
  updateUser(u => ({
    ...u,
    heatmap: { ...u.heatmap, [hk]: (u.heatmap?.[hk] || 0) + sessions },
  }))
}

export function logFocus(topic, mins) {
  const now = new Date()
  const hk = now.toISOString().split('T')[0]
  updateUser(u => ({
    ...u,
    focusLog: [
      { topic, mins, date: now.toISOString(), dstr: now.toDateString() },
      ...(u.focusLog || []),
    ],
    heatmap: { ...u.heatmap, [hk]: (u.heatmap?.[hk] || 0) + Math.max(1, Math.floor(mins / 30)) },
  }))
  bumpStreak()
}

export function toggleTopicDone(key, value) {
  updateUser(u => ({
    ...u,
    progress: { ...(u.progress || {}), [key]: value },
  }))
  if (value) { logHeatmap(1); bumpStreak() }
}

export function addTask(task) {
  updateUser(u => ({ ...u, tasks: [task, ...(u.tasks || [])] }))
}

export function updateTasks(tasks) {
  updateUser(() => ({ tasks }))  // replaces only tasks key — use spread in updater
  updateUser(u => ({ ...u, tasks }))
}

export function addNote(note) {
  updateUser(u => ({ ...u, notes: [note, ...(u.notes || [])] }))
}

export function deleteNote(id) {
  updateUser(u => ({ ...u, notes: (u.notes || []).filter(n => n.id !== id) }))
}

export function setModProgress(modId, status) {
  updateUser(u => ({
    ...u,
    modProgress: { ...(u.modProgress || {}), [modId]: status },
  }))
}

export function getTodayFocusMins() {
  const user = getUser()
  if (!user) return 0
  const today = new Date().toDateString()
  return (user.focusLog || [])
    .filter(l => l.dstr === today)
    .reduce((a, l) => a + l.mins, 0)
}