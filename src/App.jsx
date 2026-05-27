import { useEffect, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Database,
  FileText,
  Flame,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Square,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import { CURRICULUM, PROJ_MODS, ROADMAP, TRACKS, getDayNumber, getDaySchedule } from './data/curriculum.js'
import { SQL_DATASETS, runSQL } from './data/sqlDatasets.js'

const USERS_KEY = 'dt_users_v3'
const SESSION_KEY = 'dt_session_v3'
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const navItems = [
  { section: 'Overview' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'Daily Schedule', icon: CalendarDays },
  { id: 'timer', label: 'Focus Timer', icon: Clock },
  { section: 'Learning' },
  { id: 'roadmap', label: 'Roadmap', icon: BookOpen },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, badge: 'tasks' },
  { id: 'sql', label: 'SQL Playground', icon: Database },
  { id: 'project', label: 'FS Project', icon: Code2 },
  { id: 'assistant', label: 'AI Coach', icon: Bot },
  { section: 'Insights' },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'notes', label: 'Notes', icon: FileText, badge: 'notes' },
]

const emptyUser = {
  progress: {},
  tasks: [],
  notes: [],
  focusLog: [],
  heatmap: {},
  streak: 0,
  lastActive: null,
  modProgress: {},
  chat: [],
  sqlAttempts: [],
}

function todayKey(date = new Date()) {
  return date.toISOString().split('T')[0]
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function makeUser({ name, email, password, startDate }) {
  return {
    ...emptyUser,
    name,
    email: email.toLowerCase(),
    passwordHash: btoa(password),
    registrationDate: startDate || todayKey(),
    createdAt: new Date().toISOString(),
  }
}

function StatCard({ label, value, sub, color = 'text-brandl', glow }) {
  return (
    <div className={`card ${glow ? 'shadow-[0_0_24px_rgba(108,99,255,.12)]' : ''}`}>
      <div className="sec-label mb-1">{label}</div>
      <div className={`font-mono font-bold text-3xl ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{sub}</div>
    </div>
  )
}

function Tag({ track, children }) {
  const tag = TRACKS[track]?.tag || track?.toLowerCase() || 'dsa'
  return <span className={`tag tag-${tag}`}>{children || track}</span>
}

function App() {
  const [users, setUsers] = useState(readUsers)
  const [session, setSession] = useState(localStorage.getItem(SESSION_KEY) || '')
  const [view, setView] = useState('dashboard')
  const [sidebar, setSidebar] = useState(false)
  const [toast, setToast] = useState('')

  const user = session ? users[session] : null

  function persist(nextUsers) {
    setUsers(nextUsers)
    saveUsers(nextUsers)
  }

  function updateUser(updater) {
    if (!user) return
    const nextUser = { ...user, ...updater(user) }
    persist({ ...users, [user.email]: nextUser })
  }

  function showToast(message) {
    setToast(message)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(''), 2400)
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setSession('')
    setView('dashboard')
  }

  if (!user) {
    return <AuthScreen users={users} persist={persist} setSession={setSession} showToast={showToast} toast={toast} />
  }

  const dayIndex = getDayNumber(user.registrationDate)
  const todaySchedule = getDaySchedule(dayIndex)
  const pendingTasks = user.tasks.filter((task) => !task.done).length

  return (
    <div className="flex min-h-screen bg-base text-[#E0E0F0]">
      {sidebar && <button className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebar(false)} aria-label="Close menu" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-surf transition-transform md:translate-x-0 md:z-10 ${sidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-border px-5 pb-4 pt-6">
          <div className="font-mono text-xl font-bold tracking-tight text-brandl">DevTrack</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">Learning OS</div>
        </div>
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 rounded-xl bg-cardb p-3">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-cream">{DAYS[new Date().getDay()]} - Day {dayIndex + 1}</div>
            <div className="font-mono text-2xl font-bold leading-tight text-white">{new Date().getDate()}</div>
            <div className="text-xs text-muted">{MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-cardb p-2.5">
            <Flame className="h-5 w-5 text-peach" />
            <div>
              <div className="font-mono text-lg font-bold leading-none text-peach">{user.streak || 0}</div>
              <div className="text-[10px] font-semibold text-muted">day streak</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {navItems.map((item, index) => {
            if (item.section) return <div key={index} className="sec-label px-3 pb-1 pt-3">{item.section}</div>
            const Icon = item.icon
            const badge = item.badge === 'tasks' ? pendingTasks : item.badge === 'notes' ? user.notes.length : 0
            return (
              <button key={item.id} className={`nav-link ${view === item.id ? 'active' : ''}`} onClick={() => { setView(item.id); setSidebar(false) }}>
                <Icon className="h-4 w-4" />
                {item.label}
                {badge > 0 && <span className="ml-auto rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>}
              </button>
            )
          })}
        </nav>
        <div className="border-t border-border px-4 pb-4 pt-2">
          <div className="sec-label mb-2">Today's Plan</div>
          <button className="mb-1.5 w-full rounded-lg border border-transparent bg-cardb p-2.5 text-left transition hover:border-brand" onClick={() => setView('schedule')}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cream">Morning</div>
            <div className="truncate text-xs font-semibold text-white">{todaySchedule.morning.title}</div>
          </button>
          <button className="w-full rounded-lg border border-transparent bg-cardb p-2.5 text-left transition hover:border-brand" onClick={() => setView('schedule')}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-peach">Evening</div>
            <div className="truncate text-xs font-semibold text-white">{todaySchedule.evening.title}</div>
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 md:ml-56">
        <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-border bg-surf px-4 py-3 md:hidden">
          <button onClick={() => setSidebar(true)} className="text-muted hover:text-white" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <span className="font-mono font-bold text-brandl">DevTrack</span>
          <button onClick={logout} className="text-xs font-semibold text-muted hover:text-red">Logout</button>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 md:px-8 md:pt-8">
          <div className="mb-3 hidden items-center justify-between md:flex">
            <div className="text-xs text-muted">Signed in as <span className="font-semibold text-white">{user.name}</span> - schedule started {user.registrationDate}</div>
            <button onClick={logout} className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-red"><LogOut className="h-3.5 w-3.5" /> Logout</button>
          </div>
          {view === 'dashboard' && <Dashboard user={user} updateUser={updateUser} setView={setView} />}
          {view === 'schedule' && <Schedule user={user} updateUser={updateUser} showToast={showToast} />}
          {view === 'timer' && <Timer user={user} updateUser={updateUser} showToast={showToast} />}
          {view === 'roadmap' && <Roadmap updateUser={updateUser} showToast={showToast} />}
          {view === 'tasks' && <Tasks user={user} updateUser={updateUser} showToast={showToast} />}
          {view === 'sql' && <SqlPlayground user={user} updateUser={updateUser} showToast={showToast} />}
          {view === 'project' && <Project user={user} updateUser={updateUser} showToast={showToast} />}
          {view === 'assistant' && <Coach user={user} updateUser={updateUser} />}
          {view === 'progress' && <Progress user={user} />}
          {view === 'notes' && <Notes user={user} updateUser={updateUser} showToast={showToast} />}
        </div>
      </main>
      <div className={`fixed bottom-6 right-6 z-[999] rounded-[10px] bg-brand px-4 py-3 text-sm font-semibold text-white transition ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>{toast}</div>
    </div>
  )
}

function AuthScreen({ users, persist, setSession, showToast, toast }) {
  const [mode, setMode] = useState('register')
  const [form, setForm] = useState({ name: '', email: '', password: '', startDate: todayKey() })

  function submit(e) {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (!email || !form.password || (mode === 'register' && !form.name.trim())) return showToast('Please fill the required fields')
    if (mode === 'register') {
      if (users[email]) return showToast('Email is already registered')
      const user = makeUser({ ...form, email })
      persist({ ...users, [email]: user })
      localStorage.setItem(SESSION_KEY, email)
      setSession(email)
      return
    }
    if (!users[email]) return showToast('No account found')
    if (users[email].passwordHash !== btoa(form.password)) return showToast('Wrong password')
    localStorage.setItem(SESSION_KEY, email)
    setSession(email)
  }

  return (
    <div className="min-h-screen bg-base px-4 py-10 text-[#E0E0F0]">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.05fr_.95fr]">
        <section className="pt-4 md:pt-12">
          <div className="font-mono text-2xl font-bold text-brandl">DevTrack</div>
          <h1 className="mt-5 max-w-xl text-4xl font-black tracking-normal text-white md:text-5xl">Your preparation starts on your first login.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">Every user gets a personal Day 1 based on registration date. No backend is needed for GitHub Pages: accounts, tasks, focus logs, SQL attempts, notes, and progress are stored locally in the browser.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {['Dynamic 180-day schedule', 'SQL practice datasets', 'Manual focus timer', 'AI-style study coach'].map((item) => (
              <div key={item} className="card-sm flex items-center gap-2 text-sm font-semibold text-white"><Check className="h-4 w-4 text-grn" />{item}</div>
            ))}
          </div>
        </section>
        <form onSubmit={submit} className="card mt-2">
          <div className="mb-5 flex rounded-lg bg-surf p-1">
            <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${mode === 'register' ? 'bg-brand text-white' : 'text-muted'}`}>Register</button>
            <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${mode === 'login' ? 'bg-brand text-white' : 'text-muted'}`}>Login</button>
          </div>
          {mode === 'register' && <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
          <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
          {mode === 'register' && <Field label="Preparation start date" type="date" value={form.startDate} onChange={(startDate) => setForm({ ...form, startDate })} />}
          <button className="btn btn-p mt-2 w-full justify-center">{mode === 'register' ? <UserPlus className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}{mode === 'register' ? 'Create Account' : 'Login'}</button>
          <p className="mt-4 text-xs leading-5 text-muted">For GitHub Pages, this is intentionally 100% client-side. MongoDB can be added later only if you deploy a backend on Render/Railway and use MongoDB Atlas.</p>
        </form>
      </div>
      <div className={`fixed bottom-6 right-6 rounded-[10px] bg-brand px-4 py-3 text-sm font-semibold text-white transition ${toast ? 'opacity-100' : 'opacity-0'}`}>{toast}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="mb-3 block">
      <span className="sec-label mb-1.5 block">{label}</span>
      <input className="inp" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function Dashboard({ user, setView }) {
  const now = new Date()
  const dayIndex = getDayNumber(user.registrationDate)
  const schedule = getDaySchedule(dayIndex)
  const todayMins = user.focusLog.filter((log) => log.dstr === now.toDateString()).reduce((sum, log) => sum + log.mins, 0)
  const doneTasks = user.tasks.filter((task) => task.done).length
  const projectDone = Object.values(user.modProgress || {}).filter((status) => status === 'done').length
  const hour = now.getHours()
  const greet = hour < 12 ? 'Good morning!' : hour < 17 ? 'Good afternoon!' : 'Good evening!'

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">{greet}</h1>
          <p className="mt-1 text-sm text-muted">{FULL_DAYS[now.getDay()]} - Day {dayIndex + 1} of your preparation.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('timer')} className="btn btn-g"><Clock className="h-4 w-4" /> Start Focus</button>
          <button onClick={() => setView('tasks')} className="btn btn-p"><Plus className="h-4 w-4" /> Add Task</button>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Focus Today" value={<>{Math.round((todayMins / 60) * 10) / 10}<span className="text-base font-normal text-muted">h</span></>} sub="of 4 hr goal" glow />
        <StatCard label="Tasks Done" value={doneTasks} sub="total completed" color="text-grn" />
        <StatCard label="Streak" value={user.streak || 0} sub="days active" color="text-peach" />
        <StatCard label="Project" value={`${Math.round((projectDone / PROJ_MODS.length) * 100)}%`} sub="DevHive modules" color="text-cream" />
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <div className="card md:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="sec-label">Today's Sessions</div>
            <button onClick={() => setView('schedule')} className="text-xs font-semibold text-brand hover:text-brandl">View all</button>
          </div>
          <SessionBlock slot="Morning" session={schedule.morning} done={user.progress[`day-${dayIndex + 1}-morning`]} />
          <SessionBlock slot="Evening" session={schedule.evening} done={user.progress[`day-${dayIndex + 1}-evening`]} evening />
        </div>
        <div className="card md:col-span-2">
          <div className="mb-3 sec-label">Skill Progress</div>
          {['DSA', 'SQL', 'FS', 'ML', 'DS'].map((track) => {
            const total = CURRICULUM.flatMap((d) => [d.morning, d.evening]).filter((s) => s.track === track).length || 1
            const done = Object.entries(user.progress).filter(([key, val]) => val && key.includes(track)).length
            const pct = Math.min(100, Math.round((done / total) * 100))
            return <ProgressLine key={track} label={track} pct={pct} color={TRACKS[track]?.color || '#8B85FF'} />
          })}
        </div>
      </div>
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <div className="sec-label">Pending Tasks</div>
          <button onClick={() => setView('tasks')} className="text-xs font-semibold text-brand hover:text-brandl">Manage all</button>
        </div>
        {user.tasks.filter((task) => !task.done).slice(0, 5).map((task) => <TaskRow key={task.id} task={task} readOnly />)}
        {!user.tasks.filter((task) => !task.done).length && <Empty text="No pending tasks. Add one from Tasks or Roadmap." />}
      </div>
    </>
  )
}

function SessionBlock({ slot, session, done, evening, onToggle }) {
  return (
    <button onClick={onToggle} className={`sched-block w-full text-left ${evening ? 'eve' : ''} ${done ? 'done' : ''}`}>
      <div className="font-mono text-[10px] text-muted">{slot} - {session.est} min</div>
      <div className="sblock-title mt-1 text-sm font-bold text-white">{session.title}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2"><Tag track={session.track} />{session.mustDo && <span className="tag pri-high">must do</span>}</div>
    </button>
  )
}

function Schedule({ user, updateUser, showToast }) {
  const todayIndex = getDayNumber(user.registrationDate)
  const [selected, setSelected] = useState(todayIndex)
  const days = Array.from({ length: 14 }, (_, i) => todayIndex + i)
  const schedule = getDaySchedule(selected)

  function complete(slot, session) {
    const key = `day-${selected + 1}-${slot}-${session.track}`
    const nextValue = !user.progress[key]
    const heat = { ...(user.heatmap || {}) }
    heat[todayKey()] = (heat[todayKey()] || 0) + (nextValue ? 1 : 0)
    updateUser((u) => ({
      progress: { ...u.progress, [key]: nextValue },
      heatmap: heat,
      streak: nextValue ? nextStreak(u).streak : u.streak,
      lastActive: nextValue ? nextStreak(u).lastActive : u.lastActive,
    }))
    showToast(nextValue ? 'Session marked complete' : 'Session reopened')
  }

  return (
    <>
      <PageTitle title="Daily Schedule" sub="Generated from your registration date. Day 1 is the day you start, with no old history shown." />
      <div className="mb-6 grid grid-cols-7 gap-2 md:grid-cols-14">
        {days.map((d) => (
          <button key={d} onClick={() => setSelected(d)} className={`wday ${selected === d ? 'active' : ''}`}>
            <div className="text-[10px] font-bold uppercase text-muted">Day</div>
            <div className="font-mono text-lg font-bold text-white">{d + 1}</div>
          </button>
        ))}
      </div>
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="mb-3 sec-label">Morning - 7:00 to 9:00 AM</div>
          <SessionBlock slot="Morning" session={schedule.morning} done={user.progress[`day-${selected + 1}-morning-${schedule.morning.track}`]} onToggle={() => complete('morning', schedule.morning)} />
        </div>
        <div className="card">
          <div className="mb-3 sec-label">Evening - 6:00 to 8:00 PM</div>
          <SessionBlock slot="Evening" session={schedule.evening} done={user.progress[`day-${selected + 1}-evening-${schedule.evening.track}`]} evening onToggle={() => complete('evening', schedule.evening)} />
        </div>
      </div>
      <div className="card">
        <div className="sec-label mb-3">Schedule Rules</div>
        <div className="grid gap-3 text-sm text-muted md:grid-cols-2">
          <p>Each 2 hour block keeps one topic, so arrays, strings, graphs, and DP get enough breathing room.</p>
          <p>SQL has dedicated practice days with datasets instead of being hidden inside Data Science.</p>
          <p>Morning prioritizes DSA, SQL, ML, and DS. Evening keeps Full Stack and project momentum alive.</p>
          <p>The schedule extends forward from your Day 1 and loops into mixed revision after the core plan.</p>
        </div>
      </div>
    </>
  )
}

function Timer({ user, updateUser, showToast }) {
  const [minutes, setMinutes] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [topic, setTopic] = useState('DSA - Arrays Practice')

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((sec) => {
        if (sec <= 1) {
          window.clearInterval(id)
          setRunning(false)
          log(minutes)
          return 0
        }
        return sec - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  // The interval only needs the active preset; manual log reads live state from the button path.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, minutes])

  function setPreset(min) {
    setRunning(false)
    setMinutes(min)
    setRemaining(min * 60)
  }

  function log(mins = Math.max(1, Math.round((minutes * 60 - remaining) / 60))) {
    const now = new Date()
    const heat = { ...(user.heatmap || {}) }
    heat[todayKey()] = (heat[todayKey()] || 0) + Math.max(1, Math.floor(mins / 30))
    const streak = nextStreak(user)
    updateUser((u) => ({
      focusLog: [{ topic, mins, date: now.toISOString(), dstr: now.toDateString() }, ...u.focusLog],
      heatmap: heat,
      streak: streak.streak,
      lastActive: streak.lastActive,
    }))
    showToast(`${mins} minutes logged`)
    setPreset(minutes)
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const todayLogs = user.focusLog.filter((item) => item.dstr === new Date().toDateString())

  return (
    <>
      <PageTitle title="Focus Timer" sub="Manual minutes, Pomodoro presets, full 2 hour blocks, and topic-based logging." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card flex flex-col items-center">
          <div className="relative grid h-[210px] w-[210px] place-items-center rounded-full border-[9px] border-cardb">
            <div className="text-center">
              <div className="font-mono text-4xl font-bold text-white">{mm}:{ss}</div>
              <div className="mt-1 text-xs font-semibold text-muted">{running ? 'Focusing' : 'Ready'}</div>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn btn-p" onClick={() => setRunning(!running)}>{running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}{running ? 'Pause' : 'Start'}</button>
            <button className="btn btn-g" onClick={() => setPreset(minutes)}><RotateCcw className="h-4 w-4" /> Reset</button>
            <button className="btn btn-g" onClick={() => log()}><Save className="h-4 w-4" /> Log</button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[25, 50, 90, 120].map((min) => <button key={min} onClick={() => setPreset(min)} className="btn btn-g px-3 py-1.5 text-xs">{min} min</button>)}
          </div>
          <div className="mt-4 w-full">
            <label className="sec-label mb-1.5 block">Manual minutes</label>
            <input className="inp" type="number" min="1" value={minutes} onChange={(e) => setPreset(Number(e.target.value || 1))} />
            <label className="sec-label mb-1.5 mt-3 block">Current Topic</label>
            <input className="inp" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
        </div>
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <div className="sec-label">Today's Focus Log</div>
            <span className="font-mono text-xs font-bold text-brandl">{todayLogs.reduce((a, b) => a + b.mins, 0)} min</span>
          </div>
          {todayLogs.map((log, index) => (
            <div key={index} className="flex items-center justify-between border-b border-border py-2 text-sm">
              <span className="truncate font-semibold text-white">{log.topic}</span>
              <span className="font-mono text-brandl">{log.mins}m</span>
            </div>
          ))}
          {!todayLogs.length && <Empty text="No focus sessions logged today." />}
          <WeeklyBars user={user} />
        </div>
      </div>
    </>
  )
}

function Roadmap({ updateUser, showToast }) {
  const [open, setOpen] = useState(0)
  function addTask(track, title) {
    updateUser((u) => ({ tasks: [{ id: Date.now(), title, track: track.includes('SQL') ? 'SQL' : track.split(' ')[0], pri: 'med', phase: 'Roadmap', due: todayKey(), notes: '', done: false }, ...u.tasks] }))
    showToast('Roadmap task added')
  }
  return (
    <>
      <PageTitle title="Learning Roadmap" sub="Placement-focused order: DSA, SQL, Full Stack Project, ML, and Data Science." />
      <div className="card mb-4 border-l-4 border-brand">
        <div className="sec-label mb-2">Priority Order</div>
        <div className="flex flex-wrap gap-2"><Tag track="DSA" /><Tag track="SQL" /><Tag track="FS">Full Stack</Tag><Tag track="ML" /><Tag track="DS" /></div>
      </div>
      {ROADMAP.map((track, index) => (
        <div key={track.track} className={`card ph-${track.tag} mb-4`}>
          <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(open === index ? -1 : index)}>
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg font-mono text-sm font-bold" style={{ background: `${track.color}22`, color: track.color }}>0{index + 1}</div>
              <div><div className="font-bold text-white">{track.track}</div><div className="text-xs text-muted">{track.dur}</div></div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted transition ${open === index ? 'rotate-180' : ''}`} />
          </button>
          {open === index && (
            <div className="mt-4 space-y-4">
              {track.phases.map((phase) => (
                <div key={phase.name} className="rounded-xl bg-cardb p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{phase.name}</div>
                    <div className="text-xs italic text-muted">{phase.target || phase.weeks}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">{phase.topics.map((topic) => <button key={topic} onClick={() => addTask(track.track, topic)} className="topic-chip">{topic}</button>)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  )
}

function Tasks({ user, updateUser, showToast }) {
  const [filter, setFilter] = useState('all')
  const [draft, setDraft] = useState({ title: '', track: 'DSA', pri: 'med', phase: '', due: todayKey(), notes: '' })
  const list = user.tasks.filter((task) => filter === 'all' || (filter === 'pending' ? !task.done : task.track === filter))

  function addTask(e) {
    e.preventDefault()
    if (!draft.title.trim()) return showToast('Enter a task title')
    updateUser((u) => ({ tasks: [{ ...draft, id: Date.now(), done: false }, ...u.tasks] }))
    setDraft({ ...draft, title: '', phase: '', notes: '' })
    showToast('Task saved')
  }

  function patchTask(id, patch) {
    const nextTasks = user.tasks.map((task) => task.id === id ? { ...task, ...patch } : task)
    const streak = patch.done ? nextStreak(user) : user
    updateUser(() => ({ tasks: nextTasks, streak: streak.streak, lastActive: streak.lastActive }))
  }

  return (
    <>
      <PageTitle title="Task Board" sub="Learning tasks, practice problems, reminders, and project to-dos." />
      <form onSubmit={addTask} className="card mb-5 grid gap-3 md:grid-cols-6">
        <input className="inp md:col-span-2" placeholder="Task title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <select className="inp" value={draft.track} onChange={(e) => setDraft({ ...draft, track: e.target.value })}>{['DSA', 'SQL', 'ML', 'DS', 'FS', 'Project'].map((t) => <option key={t}>{t}</option>)}</select>
        <select className="inp" value={draft.pri} onChange={(e) => setDraft({ ...draft, pri: e.target.value })}><option value="high">High</option><option value="med">Medium</option><option value="low">Low</option></select>
        <input className="inp" type="date" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
        <button className="btn btn-p justify-center"><Plus className="h-4 w-4" /> Add</button>
      </form>
      <div className="mb-5 flex flex-wrap gap-2">{['all', 'DSA', 'SQL', 'ML', 'DS', 'FS', 'Project', 'pending'].map((f) => <button key={f} onClick={() => setFilter(f)} className={`btn px-3 py-1.5 text-xs ${filter === f ? 'btn-p' : 'btn-g'}`}>{f}</button>)}</div>
      <div>{list.map((task) => <TaskRow key={task.id} task={task} onToggle={() => patchTask(task.id, { done: !task.done })} onDelete={() => updateUser(() => ({ tasks: user.tasks.filter((t) => t.id !== task.id) }))} />)}{!list.length && <Empty text="No tasks in this view." />}</div>
    </>
  )
}

function TaskRow({ task, onToggle, onDelete, readOnly }) {
  return (
    <div className={`task-item ${task.done ? 'tdone' : ''}`}>
      <button className={`chk ${task.done ? 'on' : ''}`} onClick={onToggle} disabled={readOnly} aria-label="Toggle task">{task.done && <Check className="h-3 w-3 text-white" />}</button>
      <div className="min-w-0 flex-1">
        <div className="task-title text-sm font-semibold text-white">{task.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted"><Tag track={task.track} />{task.due && <span className="font-mono text-[10px]">{task.due}</span>}{task.phase && <span>{task.phase}</span>}</div>
      </div>
      <span className={`tag ${task.pri === 'high' ? 'pri-high' : task.pri === 'low' ? 'pri-low' : 'pri-med'}`}>{task.pri}</span>
      {!readOnly && <button onClick={onDelete} className="text-muted hover:text-red" aria-label="Delete task"><Trash2 className="h-4 w-4" /></button>}
    </div>
  )
}

function SqlPlayground({ updateUser, showToast }) {
  const [dataset, setDataset] = useState('employees')
  const [query, setQuery] = useState(SQL_DATASETS.employees.sampleQueries[0])
  const [result, setResult] = useState(null)
  const data = SQL_DATASETS[dataset]

  function run() {
    const output = runSQL(query, dataset)
    setResult(output)
    updateUser((u) => ({ sqlAttempts: [{ id: Date.now(), dataset, query, ok: !output.error, date: new Date().toISOString() }, ...(u.sqlAttempts || [])].slice(0, 30) }))
    showToast(output.error ? 'Query needs fixing' : 'Query executed')
  }

  return (
    <>
      <PageTitle title="SQL Playground" sub="Practice SQL on built-in HR and e-commerce datasets. Runs fully in the browser." />
      <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <div className="card">
          <div className="mb-2 sec-label">Dataset</div>
          <select className="inp mb-3" value={dataset} onChange={(e) => { setDataset(e.target.value); setQuery(SQL_DATASETS[e.target.value].sampleQueries[0]); setResult(null) }}>{Object.entries(SQL_DATASETS).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}</select>
          <p className="mb-3 text-sm text-muted">{data.description}</p>
          {Object.entries(data.tables).map(([name, rows]) => <div key={name} className="mb-3 rounded-lg border border-border bg-cardb p-3"><div className="font-mono text-xs font-bold text-brandl">{name}</div><div className="mt-1 text-xs text-muted">{Object.keys(rows[0]).join(', ')}</div></div>)}
          <div className="sec-label mb-2">Sample Queries</div>
          <div className="space-y-2">{data.sampleQueries.map((sample) => <button key={sample} onClick={() => setQuery(sample)} className="w-full rounded-lg border border-border bg-surf p-2 text-left text-xs text-muted hover:border-brand hover:text-white">{sample}</button>)}</div>
        </div>
        <div className="card">
          <textarea className="inp min-h-[170px] font-mono text-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button onClick={run} className="btn btn-p mt-3"><Play className="h-4 w-4" /> Run Query</button>
          <div className="mt-4 overflow-auto">
            {result?.error && <div className="rounded-lg bg-red/10 p-3 text-sm text-red">{result.error}</div>}
            {result?.rows && <ResultTable result={result} />}
            {!result && <Empty text="Run a query to see results." />}
          </div>
        </div>
      </div>
    </>
  )
}

function ResultTable({ result }) {
  return (
    <table className="w-full min-w-[520px] border-collapse text-sm">
      <thead>{result.columns.map((col) => <th key={col} className="border border-border bg-surf px-3 py-2 text-left text-xs uppercase text-muted">{col}</th>)}</thead>
      <tbody>{result.rows.map((row, i) => <tr key={i}>{result.columns.map((col) => <td key={col} className="border border-border px-3 py-2 text-white">{String(row[col])}</td>)}</tr>)}</tbody>
    </table>
  )
}

function Project({ user, updateUser, showToast }) {
  const done = Object.values(user.modProgress || {}).filter((status) => status === 'done').length
  const pct = Math.round((done / PROJ_MODS.length) * 100)
  return (
    <>
      <PageTitle title="Full Stack Project" sub="DevHive - developer Q&A/community platform with auth, chat, payments, search, uploads, and deployment." />
      <div className="card mb-5 border-brand/40">
        <div className="mb-2 flex items-center justify-between gap-4"><div className="text-lg font-bold text-white">DevHive Portfolio Build</div><div className="font-mono text-2xl font-bold text-brandl">{pct}%</div></div>
        <ProgressLine label="Overall" pct={pct} color="#8B85FF" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {PROJ_MODS.map((mod) => {
          const status = user.modProgress?.[mod.id] || 'not-started'
          return (
            <div key={mod.id} className="card">
              <div className="mb-2 flex items-start justify-between gap-2"><div className="text-sm font-bold text-white">{mod.name}</div><span className={`tag ${status === 'done' ? 'st-d' : status === 'in-progress' ? 'st-ip' : 'st-ns'}`}>{status}</span></div>
              <div className="mb-2 text-xs text-muted">Estimate: {mod.time}</div>
              <div className="mb-3 flex flex-wrap gap-1">{mod.features.map((feature) => <span key={feature} className="topic-chip">{feature}</span>)}</div>
              <div className="flex flex-wrap gap-1.5">{['in-progress', 'done', 'not-started'].map((next) => <button key={next} className="btn btn-g px-2.5 py-1 text-[11px]" onClick={() => { updateUser((u) => ({ modProgress: { ...u.modProgress, [mod.id]: next } })); showToast(`Module set to ${next}`) }}>{next}</button>)}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Coach({ user, updateUser }) {
  const [prompt, setPrompt] = useState('')
  const day = getDayNumber(user.registrationDate) + 1
  const today = getDaySchedule(day - 1)

  function reply(text) {
    const lower = text.toLowerCase()
    if (lower.includes('sql')) return 'For SQL today: open SQL Playground, choose HR Database, run one JOIN query, one GROUP BY query, and one window-function style query. Save confusing patterns as notes.'
    if (lower.includes('ml') || lower.includes('machine')) return 'For ML, write the concept in plain English first, then code a tiny example. Track metrics and note mistakes. Avoid jumping to deep learning before preprocessing and supervised basics are clear.'
    if (lower.includes('dsa')) return 'For DSA, do 20 minutes of pattern revision, 70 minutes of problems, and 30 minutes of review. For must-do topics, solve fewer problems but write cleaner notes on the pattern.'
    if (lower.includes('project')) return 'For DevHive, keep one deployable vertical slice at a time: auth, post CRUD, comments, search, notifications, then polish. Each module should end with a README update.'
    return `Day ${day} plan: Morning - ${today.morning.title}. Evening - ${today.evening.title}. Keep one written note, one task completion, and one focus log today.`
  }

  function send(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    const answer = reply(prompt)
    updateUser((u) => ({ chat: [{ role: 'user', text: prompt }, { role: 'coach', text: answer }, ...(u.chat || [])].slice(0, 20) }))
    setPrompt('')
  }

  return (
    <>
      <PageTitle title="AI Coach" sub="A local rule-based chatbot for preparation guidance. It works on GitHub Pages without API keys." />
      <div className="grid gap-4 md:grid-cols-[1fr_.8fr]">
        <div className="card">
          <form onSubmit={send} className="flex gap-2">
            <input className="inp" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask about DSA, SQL, ML, project, or today's plan..." />
            <button className="btn btn-p"><MessageSquare className="h-4 w-4" /> Ask</button>
          </form>
          <div className="mt-4 space-y-3">
            {(user.chat || []).map((msg, index) => <div key={index} className={`rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-brand/20 text-white' : 'bg-cardb text-[#C0C0D0]'}`}>{msg.text}</div>)}
            {!user.chat?.length && <Empty text="Ask the coach how to structure today's preparation." />}
          </div>
        </div>
        <div className="card">
          <div className="sec-label mb-3">Smart Suggestions</div>
          {['How should I practice DSA today?', 'Give me SQL practice for today', 'How do I balance ML and project?', 'What should I build in DevHive next?'].map((q) => <button key={q} onClick={() => setPrompt(q)} className="mb-2 w-full rounded-lg border border-border bg-cardb p-3 text-left text-sm text-white hover:border-brand">{q}</button>)}
        </div>
      </div>
    </>
  )
}

function Progress({ user }) {
  return (
    <>
      <PageTitle title="Progress & Analytics" sub="Heatmap, weekly focus, topic breakdown, and task stats per track." />
      <div className="card mb-4">
        <div className="sec-label mb-3">Activity Heatmap</div>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}>
          {Array.from({ length: 364 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (363 - i))
            const v = user.heatmap?.[todayKey(d)] || 0
            return <div key={i} className={`hcell ${v === 1 ? 'h1' : v === 2 ? 'h2' : v === 3 ? 'h3' : v > 3 ? 'h4' : ''} ${i === 363 ? 'today-cell' : ''}`} title={`${todayKey(d)}: ${v}`} />
          })}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card"><div className="sec-label mb-3">Last 7 Days</div><WeeklyBars user={user} /></div>
        <div className="card">
          <div className="sec-label mb-3">Task Stats by Track</div>
          <div className="grid grid-cols-2 gap-3">
            {['DSA', 'SQL', 'ML', 'FS'].map((track) => {
              const all = user.tasks.filter((task) => task.track === track)
              const done = all.filter((task) => task.done).length
              return <div key={track} className="card-sm"><div className="text-sm font-bold" style={{ color: TRACKS[track]?.color }}>{track}</div><div className="font-mono text-2xl font-bold text-white">{done}<span className="text-sm font-normal text-muted">/{all.length}</span></div></div>
            })}
          </div>
        </div>
      </div>
    </>
  )
}

function Notes({ user, updateUser, showToast }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState({ track: 'DSA', title: '', text: '', tags: '' })
  const notes = user.notes.filter((note) => (filter === 'all' || note.track === filter) && `${note.title} ${note.text} ${note.tags}`.toLowerCase().includes(search.toLowerCase()))

  function save(e) {
    e.preventDefault()
    if (!draft.text.trim()) return showToast('Write a note first')
    updateUser((u) => ({ notes: [{ ...draft, id: Date.now(), date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }, ...u.notes] }))
    setDraft({ ...draft, title: '', text: '', tags: '' })
    showToast('Note saved')
  }

  return (
    <>
      <PageTitle title="Learning Notes" sub="Rich learning capture with tags, search, code snippets, and track filters." />
      <form onSubmit={save} className="card mb-5 grid gap-3 md:grid-cols-4">
        <select className="inp" value={draft.track} onChange={(e) => setDraft({ ...draft, track: e.target.value })}>{['DSA', 'SQL', 'ML', 'DS', 'FS', 'General'].map((t) => <option key={t}>{t}</option>)}</select>
        <input className="inp md:col-span-2" placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input className="inp" placeholder="tags: arrays, joins" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
        <textarea className="inp md:col-span-4 min-h-[120px] font-mono" placeholder="Use bullets, code snippets, formulas, mistakes, and final patterns..." value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
        <button className="btn btn-p md:col-span-4 justify-center"><Save className="h-4 w-4" /> Save Note</button>
      </form>
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" /><input className="inp pl-9" placeholder="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        {['all', 'DSA', 'SQL', 'ML', 'DS', 'FS', 'General'].map((f) => <button key={f} onClick={() => setFilter(f)} className={`btn px-3 py-1.5 text-xs ${filter === f ? 'btn-p' : 'btn-g'}`}>{f}</button>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {notes.map((note) => <div key={note.id} className="note-card"><div className="mb-2 flex items-start justify-between gap-3"><div><Tag track={note.track} />{note.title && <div className="mt-2 text-sm font-bold text-white">{note.title}</div>}</div><button onClick={() => updateUser(() => ({ notes: user.notes.filter((n) => n.id !== note.id) }))} className="text-muted hover:text-red"><X className="h-4 w-4" /></button></div><pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#C0C0D0]">{note.text}</pre>{note.tags && <div className="mt-3 text-xs text-muted">{note.tags}</div>}</div>)}
      </div>
      {!notes.length && <Empty text="No notes match this view." />}
    </>
  )
}

function PageTitle({ title, sub }) {
  return <div className="mb-6"><h1 className="text-3xl font-bold text-white">{title}</h1><p className="mt-1 text-sm text-muted">{sub}</p></div>
}

function Empty({ text }) {
  return <div className="py-8 text-center text-sm text-muted">{text}</div>
}

function ProgressLine({ label, pct, color }) {
  return <div className="mb-3"><div className="mb-1 flex justify-between text-xs"><span className="font-semibold" style={{ color }}>{label}</span><span className="font-mono text-muted">{pct}%</span></div><div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%`, background: color }} /></div></div>
}

function WeeklyBars({ user }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const mins = user.focusLog.filter((log) => log.dstr === d.toDateString()).reduce((sum, log) => sum + log.mins, 0)
    return { day: DAYS[d.getDay()], mins }
  })
  const max = Math.max(1, ...days.map((d) => d.mins))
  return <div className="mt-4"><div className="flex h-20 items-end gap-2">{days.map((d) => <div key={d.day} className="flex-1 rounded-t bg-brand" style={{ height: `${Math.max(4, (d.mins / max) * 76)}px`, opacity: d.mins ? 1 : 0.22 }} title={`${d.mins} min`} />)}</div><div className="mt-1 flex gap-2">{days.map((d) => <div key={d.day} className="flex-1 text-center text-[10px] font-semibold text-muted">{d.day}</div>)}</div></div>
}

function nextStreak(user) {
  const today = new Date().toDateString()
  if (user.lastActive === today) return { streak: user.streak || 0, lastActive: today }
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  return { streak: user.lastActive === yesterday ? (user.streak || 0) + 1 : 1, lastActive: today }
}

export default App
