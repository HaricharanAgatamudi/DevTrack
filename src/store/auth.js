// All user data lives in localStorage under key: dt_users
// Active session: dt_session

export function getUsers() {
  return JSON.parse(localStorage.getItem('dt_users') || '{}')
}

export function saveUsers(users) {
  localStorage.setItem('dt_users', JSON.stringify(users))
}

export function getCurrentUser() {
  const email = localStorage.getItem('dt_session')
  if (!email) return null
  const users = getUsers()
  return users[email] || null
}

export function register({ name, email, password }) {
  const users = getUsers()
  if (users[email]) return { error: 'Email already registered' }

  const today = new Date().toISOString().split('T')[0]
  const user = {
    name,
    email,
    // simple hash — good enough for local storage
    passwordHash: btoa(password),
    registrationDate: today,   // ← Day 1 of their schedule
    createdAt: new Date().toISOString(),
    progress: {},              // topicKey: true/false
    tasks: [],
    notes: [],
    focusLog: [],
    heatmap: {},
    streak: 0,
    lastActive: null,
    modProgress: {},
  }

  users[email] = user
  saveUsers(users)
  localStorage.setItem('dt_session', email)
  return { user }
}

export function login({ email, password }) {
  const users = getUsers()
  const user = users[email]
  if (!user) return { error: 'No account found with this email' }
  if (user.passwordHash !== btoa(password)) return { error: 'Wrong password' }
  localStorage.setItem('dt_session', email)
  return { user }
}

export function logout() {
  localStorage.removeItem('dt_session')
}

export function updateUser(updater) {
  const email = localStorage.getItem('dt_session')
  if (!email) return
  const users = getUsers()
  users[email] = { ...users[email], ...updater(users[email]) }
  saveUsers(users)
  return users[email]
}