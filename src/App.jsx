import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const REACT_PATHS = {
  coffee: (<><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="#c97a3a" stroke="#7a4a1f" strokeWidth="1.600" strokeLinejoin="round" /><path d="M16 10h1.500a2.500 2.500 0 0 1 0 5H16" fill="none" stroke="#7a4a1f" strokeWidth="1.600" /><path d="M8 3c-1 1.200 1 2 0 3.500M12 3c-1 1.200 1 2 0 3.500" fill="none" stroke="#a8a29e" strokeWidth="1.500" strokeLinecap="round" /></>),
  fire: (<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 2 3 4 1-3 1-6 1-9z" fill="#f97316" stroke="#c2410c" strokeWidth="1.400" strokeLinejoin="round" />),
  clap: (<><path d="M5 14l4-8 3 2 2-3 4 5-2 8-6 2z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.500" strokeLinejoin="round" /><path d="M3 8l1.500 1M6 3l1 1.500M20 4l-1 1.500" stroke="#b45309" strokeWidth="1.500" strokeLinecap="round" /></>),
  strong: (<path d="M4 14c2-1 3-4 5-5l3 1 3-4 4 3-3 7c-1 2-3 4-6 4s-6-2-6-6z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.500" strokeLinejoin="round" />),
  party: (<><path d="M3 21l5-13 8 8z" fill="#ec4899" stroke="#9d174d" strokeWidth="1.500" strokeLinejoin="round" /><path d="M12 5l1-2M16 8l3-1M17 4l1 1.500M20 12l1.500.5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /></>),
  book: (<><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1.500" strokeLinejoin="round" /><path d="M8 17h11" stroke="#1d4ed8" strokeWidth="1.500" /></>),
}

function ReactIcon({ name, className = '' }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{REACT_PATHS[name] || <circle cx="12" cy="12" r="6" fill="#d6d3d1" />}</svg>
}

const SUPABASE_URL = 'https://uijyoxkppndiyboguhzm.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ntTZHgBcoK8a5_EQwVepIQ_60e9yDPg'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CHANNEL_PREFIX = 'study-room:'
const FOCUS_PRESETS = [15, 25, 45]
const BREAK_PRESETS = [5, 10]
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const AVATAR_COLORS = ['#c2410c', '#b45309', '#a16207', '#4d7c0f', '#0f766e', '#0e7490', '#7c3aed', '#be185d']
const REACTIONS = ['coffee', 'fire', 'clap', 'strong', 'party', 'book']

function makeCode() {
  let c = ''
  for (let i = 0; i < 4; i++) c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return c
}

function newRev() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000)
}

function fmt(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[880, 660, 880].forEach((f, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.value = f
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18)
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.18 + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.16)
      o.start(ctx.currentTime + i * 0.18)
      o.stop(ctx.currentTime + i * 0.18 + 0.17)
    })
  } catch { /* audio blocked until user gesture */ }
}

/* ---------------- Home screen ---------------- */

function Home({ onJoin }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('study-rooms-me') || '{}') } catch { return {} } })()
  const [name, setName] = useState(saved.name || '')
  const [goal, setGoal] = useState(saved.goal || '')
  const [code, setCode] = useState((location.hash.match(/room=([A-Z0-9]{4})/i) || [])[1] || '')

  const valid = name.trim().length > 0

  function join(roomCode) {
    if (!valid) return
    const me = {
      id: sessionStorage.getItem('study-rooms-id') || crypto.randomUUID(),
      name: name.trim(),
      goal: goal.trim(),
    }
    sessionStorage.setItem('study-rooms-id', me.id)
    localStorage.setItem('study-rooms-me', JSON.stringify({ name: me.name, goal: me.goal }))
    me.color = AVATAR_COLORS[[...me.id].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
    onJoin(roomCode.toUpperCase(), me)
  }

  const input =
    'w-full rounded-xl border border-stone-300 bg-white/80 px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600/50'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-3 flex justify-center text-orange-500"><ReactIcon name="coffee" className="h-12 w-12" /></div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-stone-900 tracking-tight">
            Study Rooms
          </h1>
          <p className="mt-3 text-stone-600 leading-relaxed">
            Shared Pomodoro rooms, synced live. Open a room, send the code,
            and focus together, wherever everyone is.
          </p>
        </div>

        <div className="rounded-3xl bg-white/70 backdrop-blur border border-stone-200 shadow-xl shadow-orange-900/5 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Your name</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Malak" maxLength={24} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">
              What are you studying? <span className="text-stone-400">(optional)</span>
            </label>
            <input className={input} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. React hooks, chapter 3…" maxLength={60} />
          </div>

          <button
            onClick={() => join(makeCode())}
            disabled={!valid}
            className="w-full rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-semibold py-3 shadow-lg shadow-orange-700/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Start a new room
          </button>

          <div className="flex items-center gap-3 text-stone-400 text-sm">
            <div className="h-px flex-1 bg-stone-200" />
            or join one
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="flex gap-2">
            <input
              className={`${input} uppercase tracking-[0.4em] text-center font-mono font-bold`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
              placeholder="CODE"
              maxLength={4}
            />
            <button
              onClick={() => code.length === 4 && join(code)}
              disabled={!valid || code.length !== 4}
              className="rounded-xl border-2 border-orange-700 text-orange-800 font-semibold px-5 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Join
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Built by Malak Mohamed · React, Tailwind CSS, Supabase Realtime
        </p>
      </div>
    </div>
  )
}

/* ---------------- Timer ring ---------------- */

function Ring({ fraction, running, mode }) {
  const size = 280
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7e0d5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={mode === 'focus' ? '#c2410c' : '#0f766e'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - fraction)}
          style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.4s' }}
        />
      </svg>
      {running && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`block w-3 h-3 rounded-full ${mode === 'focus' ? 'bg-orange-700' : 'bg-teal-700'} animate-ping absolute opacity-60`} style={{ marginTop: -size + 44 }} />
        </div>
      )}
    </div>
  )
}

/* ---------------- Room screen ---------------- */

function Room({ code, me, onLeave }) {
  const [members, setMembers] = useState([]) // [{id, name, goal, color, joinedAt}]
  const [timer, setTimer] = useState({ mode: 'focus', running: false, remaining: 25 * 60, total: 25 * 60, endsAt: null, sessions: 0, rev: 0 })
  const [now, setNow] = useState(Date.now())
  const [floats, setFloats] = useState([])
  const [copied, setCopied] = useState(false)
  const [connected, setConnected] = useState(false)

  const channelRef = useRef(null)
  const timerRef = useRef(timer)
  const membersRef = useRef(members)
  timerRef.current = timer
  membersRef.current = members

  const eldestId = useMemo(() => {
    const all = [...members.map((m) => ({ id: m.id, joinedAt: m.joinedAt })), { id: me.id, joinedAt: me.joinedAt }]
    all.sort((a, b) => a.joinedAt - b.joinedAt)
    return all[0]?.id
  }, [members, me])
  const eldestRef = useRef(eldestId)
  eldestRef.current = eldestId

  useEffect(() => {
    const myJoinedAt = Date.now()
    me.joinedAt = myJoinedAt
    const ch = supabase.channel(CHANNEL_PREFIX + code, {
      config: { presence: { key: me.id }, broadcast: { self: false } },
    })
    channelRef.current = ch

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState()
      const list = Object.entries(state).map(([id, metas]) => ({ id, ...metas[0] }))
      setMembers(list)
    })

    ch.on('broadcast', { event: 'timer' }, ({ payload }) => {
      if (payload.rev > timerRef.current.rev) setTimer(payload)
    })

    ch.on('broadcast', { event: 'state' }, ({ payload }) => {
      if (payload.rev > timerRef.current.rev) setTimer(payload)
    })

    ch.on('broadcast', { event: 'request-state' }, () => {
      if (eldestRef.current === me.id) {
        ch.send({ type: 'broadcast', event: 'state', payload: timerRef.current })
      }
    })

    ch.on('broadcast', { event: 'react' }, ({ payload }) => {
      addFloat(payload)
      if (document.hidden) return
    })

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true)
        await ch.track({ name: me.name, goal: me.goal, color: me.color, joinedAt: myJoinedAt })
        setTimeout(() => {
          if (timerRef.current.rev === 0) {
            ch.send({ type: 'broadcast', event: 'request-state', payload: { from: me.id } })
          }
        }, 800)
      }
    })

    return () => {
      supabase.removeChannel(ch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // ticking clock + finish detection (eldest advances the shared state)
  useEffect(() => {
    const iv = setInterval(() => {
      setNow(Date.now())
      const t = timerRef.current
      if (t.running && t.endsAt && t.endsAt <= Date.now() && eldestRef.current === me.id) {
        const doneFocus = t.mode === 'focus'
        const nextMode = doneFocus ? 'break' : 'focus'
        const patch = {
          mode: nextMode,
          running: false,
          remaining: (doneFocus ? 5 : 25) * 60,
          total: (doneFocus ? 5 : 25) * 60,
          endsAt: null,
          sessions: t.sessions + (doneFocus ? 1 : 0),
          rev: newRev(),
        }
        setTimer(patch)
        channelRef.current?.send({ type: 'broadcast', event: 'timer', payload: patch })
        beep()
      }
    }, 500)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayRemaining = timer.running && timer.endsAt
    ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
    : timer.remaining

  useEffect(() => {
    document.title = `${fmt(displayRemaining)} ${timer.mode === 'focus' ? '· Focus' : '· Break'} — Study Rooms`
  }, [displayRemaining, timer.mode])

  function push(patch) {
    const next = { ...timerRef.current, ...patch, rev: newRev() }
    setTimer(next)
    channelRef.current?.send({ type: 'broadcast', event: 'timer', payload: next })
  }

  const controls = {
    start: () => push({ running: true, endsAt: Date.now() + timerRef.current.remaining * 1000 }),
    pause: () => push({ running: false, remaining: displayRemaining, endsAt: null }),
    reset: () => push({ running: false, remaining: timerRef.current.total, endsAt: null }),
    switchMode: () => {
      const next = timerRef.current.mode === 'focus' ? 'break' : 'focus'
      const mins = next === 'focus' ? 25 : 5
      push({ mode: next, running: false, remaining: mins * 60, total: mins * 60, endsAt: null })
    },
    preset: (mins) => push({ running: false, remaining: mins * 60, total: mins * 60, endsAt: null }),
  }

  function addFloat(p) {
    const id = `${Date.now()}-${Math.random()}`
    const x = 15 + Math.random() * 70
    setFloats((f) => [...f, { ...p, id, x }])
    setTimeout(() => setFloats((f) => f.filter((e) => e.id !== id)), 3200)
  }

  function react(emoji) {
    const p = { emoji, name: me.name, color: me.color }
    addFloat(p)
    channelRef.current?.send({ type: 'broadcast', event: 'react', payload: p })
  }

  function copyLink() {
    const link = `${location.origin}${location.pathname}#room=${code}`
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const ringFraction = Math.min(1, Math.max(0, displayRemaining / Math.max(1, timer.total)))

  const presets = timer.mode === 'focus' ? FOCUS_PRESETS : BREAK_PRESETS
  const everyone = [...members].sort((a, b) => a.joinedAt - b.joinedAt)

  const btnBase = 'rounded-xl font-semibold transition-colors'
  const presetsRow = (
    <div className="flex justify-center gap-2">
      {presets.map((m) => (
        <button
          key={m}
          onClick={() => controls.preset(m)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            timer.total === m * 60
              ? 'bg-stone-800 text-white border-stone-800'
              : 'border-stone-300 text-stone-500 hover:border-stone-500'
          }`}
        >
          {m}m
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* floating reactions */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
        {floats.map((f) => (
          <div key={f.id} className="float-up absolute bottom-8 text-4xl" style={{ left: `${f.x}%` }}>
            <ReactIcon name={f.emoji} className="mx-auto h-10 w-10" />
            <span className="block text-xs font-medium text-center mt-1" style={{ color: f.color }}>{f.name}</span>
          </div>
        ))}
      </div>

      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4">
        <button onClick={onLeave} className="font-display text-xl font-semibold text-stone-800">
          <ReactIcon name="coffee" className="mr-1.5 inline h-6 w-6 align-[-5px] text-orange-500" />Study Rooms
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-stone-500">room</span>
          <span className="font-mono font-bold tracking-[0.3em] text-stone-800 bg-white/80 border border-stone-200 rounded-lg px-3 py-1.5">
            {code}
          </span>
          <button
            onClick={copyLink}
            className="text-sm font-medium rounded-lg bg-stone-800 text-white px-3.5 py-2 hover:bg-stone-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy invite link'}
          </button>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-teal-600' : 'bg-stone-300'}`} title={connected ? 'Live' : 'Connecting'} />
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-10 grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        {/* timer card */}
        <section className="rounded-3xl bg-white/70 backdrop-blur border border-stone-200 shadow-xl shadow-orange-900/5 p-6 sm:p-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-full ${
                timer.mode === 'focus' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'
              }`}
            >
              {timer.mode === 'focus' ? 'Focus time' : 'Break time'}
            </span>
            <button onClick={controls.switchMode} className="text-xs font-medium text-stone-400 hover:text-stone-600 underline underline-offset-2">
              switch
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <Ring fraction={ringFraction} running={timer.running} mode={timer.mode} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-6xl sm:text-7xl font-semibold text-stone-900 tabular-nums">
                {fmt(displayRemaining)}
              </div>
              <div className="text-sm text-stone-500 mt-1">
                {timer.sessions} {timer.sessions === 1 ? 'session' : 'sessions'} done
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {timer.running ? (
              <button onClick={controls.pause} className={`${btnBase} bg-stone-800 text-white px-8 py-3 hover:bg-stone-700`}>
                Pause
              </button>
            ) : (
              <button onClick={controls.start} className={`${btnBase} bg-orange-700 text-white px-8 py-3 hover:bg-orange-600 shadow-lg shadow-orange-700/25`}>
                {displayRemaining < timer.remaining && displayRemaining > 0 ? 'Resume' : 'Start focus'}
              </button>
            )}
            <button onClick={controls.reset} className={`${btnBase} border-2 border-stone-300 text-stone-600 px-6 py-[10px] hover:border-stone-500`}>
              Reset
            </button>
          </div>

          {presetsRow}

          {/* reactions */}
          <div className="w-full border-t border-stone-200 pt-5">
            <div className="text-xs font-medium text-stone-400 text-center mb-2.5">Send some energy</div>
            <div className="flex justify-center gap-2">
              {REACTIONS.map((e) => (
                <button
                  key={e}
                  aria-label={'Send ' + e}
                  onClick={() => react(e)}
                  className="text-2xl w-12 h-12 rounded-2xl bg-white border border-stone-200 hover:scale-110 hover:border-orange-300 transition-transform"
                >
                  <ReactIcon name={e} className="mx-auto h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* members card */}
        <aside className="rounded-3xl bg-white/70 backdrop-blur border border-stone-200 shadow-xl shadow-orange-900/5 p-5">
          <h2 className="font-display font-semibold text-stone-800">
            In the room <span className="text-stone-400 font-normal">({everyone.length})</span>
          </h2>
          <ul className="mt-4 space-y-3">
            {everyone.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: m.color }}
                >
                  {(m.name || '?').slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-stone-800 truncate">
                    {m.name}
                    {m.id === me.id && <span className="text-stone-400 font-normal"> (you)</span>}
                    {m.id === eldestId && <span className="ml-1.5 text-[10px] align-middle font-semibold uppercase tracking-wide text-orange-700 bg-orange-100 rounded-full px-2 py-0.5">host</span>}
                  </div>
                  {m.goal && <div className="text-xs text-stone-500 truncate">{m.goal}</div>}
                </div>
              </li>
            ))}
          </ul>
          {everyone.length === 1 && (
            <p className="mt-4 text-sm text-stone-400 leading-relaxed">
              You're alone for now. Share the room code or the invite link and study together.
            </p>
          )}
          <div className="mt-5 rounded-2xl bg-orange-50 border border-orange-100 p-4 text-sm text-orange-900/80 leading-relaxed">
            Everyone sees the same timer. Anyone can start, pause or switch, and the whole room stays in sync.
          </div>
        </aside>
      </main>
    </div>
  )
}

/* ---------------- App ---------------- */

export default function App() {
  const [session, setSession] = useState(null) // {code, me}

  useEffect(() => {
    const onHash = () => {
      const m = location.hash.match(/room=([A-Z0-9]{4})/i)
      if (m && session) setSession({ ...session, code: m[1].toUpperCase() })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [session])

  if (!session) {
    return (
      <Home
        onJoin={(code, me) => {
          location.hash = `room=${code}`
          setSession({ code, me })
        }}
      />
    )
  }
  return (
    <Room
      code={session.code}
      me={session.me}
      onLeave={() => {
        location.hash = ''
        document.title = 'Study Rooms — shared Pomodoro rooms'
        setSession(null)
      }}
    />
  )
}
