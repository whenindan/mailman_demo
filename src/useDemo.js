import { useCallback, useEffect, useRef, useState } from 'react'

const PRESETS = [
  {
    q: 'What did we decide about the Q3 budget?',
    a: 'The team agreed to shift $40K from the marketing line into engineering headcount for Q3. Finance signed off on March 18, so the allocation is final.',
    sources: [
      { from: 'sarah@acmeco.com', subject: 'Re: Q3 Budget Review', date: 'Mar 14', snippet: '…moving $40k from marketing into eng headcount, will confirm with finance this week…' },
      { from: 'finance@acmeco.com', subject: 'Budget sign-off: Q3', date: 'Mar 18', snippet: 'Approved. Updated allocations are reflected in the shared sheet.' },
    ],
  },
  {
    q: 'Find the flight confirmation for my trip to Denver',
    a: "You're on United flight UA 1442, departing SFO at 7:10 AM on April 2nd with a connection through Denver. Confirmation details are below.",
    sources: [
      { from: 'receipts@united.com', subject: 'Your trip confirmation: SFO to DEN', date: 'Mar 29', snippet: 'Flight UA1442, Apr 2, 7:10 AM, Seat 14C…' },
      { from: 'receipts@united.com', subject: 'Check-in reminder', date: 'Apr 1', snippet: 'Check-in opens 24 hours before departure.' },
    ],
  },
  {
    q: 'Summarize threads with the design team from last week',
    a: 'Three threads: the design team locked the onboarding flow mockups, flagged contrast issues on the dark theme, and scheduled a review for Friday at 2pm.',
    sources: [
      { from: 'maya@acmeco.com', subject: 'Onboarding flow: final mockups', date: 'Mon', snippet: 'Locked the flow, one open question on step 3 copy.' },
      { from: 'design-team@acmeco.com', subject: 'Dark theme contrast pass', date: 'Wed', snippet: 'A few text/background pairs fail AA, list attached.' },
    ],
  },
]

const EXPLAINERS = [
  'I search your indexed mail with a hybrid of full-text and vector similarity, then hand the top matches to an LLM to draft an answer with citations back to the original threads.',
  "Every email you sync gets split by month, cleaned of noise and spam, chunked, and embedded into vectors. That's what lets me match on meaning, not just keywords.",
  'New mail comes in through an incremental Gmail sync: I fetch only what\'s after the last watermark, clean and vectorize it, then write it into a local LanceDB index.',
  "Nothing leaves your machine by default: splitting, cleaning, embedding, and search all run locally. I only reach out to a model if you've configured one.",
  'Ask me about a sender, a subject line, or a rough date, and I run it through the same pipeline: embed the question, search the index, then rerank the best matches before answering.',
]

const THINK_PHRASES = ['Embedding your question…', 'Searching the vector index…', 'Reranking top matches…', 'Drafting an answer…']
const SYNC_STAGES = ['fetch', 'clean', 'vectorize', 'ingest']
const SYNC_LABELS = { fetch: 'Fetching new mail…', clean: 'Cleaning & parsing…', vectorize: 'Vectorizing…', ingest: 'Ingesting into LanceDB…' }
const NODE_DEFS = [
  { n: '01', label: 'Source', sub: 'MBOX export, or a live Gmail sync', stageKey: 'fetch' },
  { n: '02', label: 'Split', sub: 'Partitions mail by month (Rust, checkpointed)', stageKey: 'fetch' },
  { n: '03', label: 'Clean', sub: 'Parses headers, strips noise, filters spam (Rust)', stageKey: 'clean' },
  { n: '04', label: 'Vectorize', sub: 'Builds embedding vectors (Python, GPU-ready)', stageKey: 'vectorize' },
  { n: '05', label: 'Ingest', sub: 'Writes chunks into LanceDB + full-text index', stageKey: 'ingest' },
  { n: '06', label: 'Query', sub: 'Hybrid search + LLM answer, cited sources', stageKey: 'query' },
]

export const FEATURES = [
  { tag: 'PRIVACY', title: 'Local-first & private', body: 'Splitting, cleaning, embedding and search all run on your machine. Email only leaves it if you point Mailman at a remote model.' },
  { tag: 'SEARCH', title: 'Hybrid search', body: 'Combines full-text and semantic vector search over every thread, so exact phrases and fuzzy meaning both surface.' },
  { tag: 'SYNC', title: 'Gmail sync', body: 'Incrementally pulls new mail using a stored watermark, so your index stays current without reprocessing your whole inbox.' },
  { tag: 'AGENTS', title: 'Agent-ready', body: 'Ships as a CLI and an agent skill, so Claude, Codex, and other coding agents can query your indexed mail directly.' },
]

export const COMMANDS = [
  'mailman pipeline ~/gmail-export.mbox --workspace my-mail',
  'mailman query "what did we decide about the budget" --workspace my-mail',
  'mailman sync --workspace my-mail',
]

export function useDemo({ startDark = false, workspaceName = 'my-mail', indexedCount = 18432 } = {}) {
  const [dark, setDark] = useState(startDark)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask about anything in your inbox, try a suggestion below, or type your own question.', sources: [] },
  ])
  const [input, setInputState] = useState('')
  const [thinking, setThinking] = useState(false)
  const [thinkingStatus, setThinkingStatus] = useState('')
  const [queryActive, setQueryActive] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStage, setSyncStage] = useState(-1)
  const [indexed, setIndexed] = useState(indexedCount)
  const [lastSynced, setLastSynced] = useState('4 hours ago')
  const [toast, setToast] = useState(null)
  const [syncHover, setSyncHover] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const messagesRef = useRef(null)
  const thinkTimer = useRef(null)
  const toastTimer = useRef(null)
  const syncTimers = useRef([])

  useEffect(() => () => {
    clearInterval(thinkTimer.current)
    clearTimeout(toastTimer.current)
    syncTimers.current.forEach(clearTimeout)
  }, [])

  const scrollToBottom = useCallback(() => {
    const run = () => {
      const el = messagesRef.current
      if (el) el.scrollTop = el.scrollHeight
    }
    requestAnimationFrame(() => { run(); requestAnimationFrame(run) })
    setTimeout(run, 60)
  }, [])

  useEffect(() => { scrollToBottom() }, [messages.length, thinking, scrollToBottom])

  const toggleDark = useCallback(() => setDark((d) => !d), [])
  const setInput = useCallback((e) => setInputState(e.target.value), [])

  const matchPreset = (text) => {
    const t = text.toLowerCase()
    if (/budget|finance|q3|money/.test(t)) return PRESETS[0]
    if (/flight|denver|trip|travel|airport/.test(t)) return PRESETS[1]
    if (/design|thread|last week|summar/.test(t)) return PRESETS[2]
    return null
  }

  const send = useCallback((overrideText) => {
    const text = (overrideText ?? input).trim()
    if (!text || thinking) return
    setInputState('')
    setMessages((m) => [...m, { role: 'user', text, sources: [] }])
    setThinking(true)
    setQueryActive(true)
    setThinkingStatus(THINK_PHRASES[0])

    let i = 0
    clearInterval(thinkTimer.current)
    thinkTimer.current = setInterval(() => {
      i = (i + 1) % THINK_PHRASES.length
      setThinkingStatus(THINK_PHRASES[i])
    }, 480)

    setTimeout(() => {
      clearInterval(thinkTimer.current)
      const preset = matchPreset(text)
      const answer = preset
        ? { role: 'assistant', text: preset.a, sources: preset.sources }
        : { role: 'assistant', text: EXPLAINERS[Math.floor(Math.random() * EXPLAINERS.length)], sources: [] }
      setMessages((m) => [...m, answer])
      setThinking(false)
      setQueryActive(false)
    }, 2000)
  }, [input, thinking])

  const pick = useCallback((q) => send(q), [send])

  const startSync = useCallback(() => {
    if (syncing) return
    setSyncing(true)
    setSyncStage(0)
    setToast(null)
    syncTimers.current = SYNC_STAGES.map((_, idx) => setTimeout(() => setSyncStage(idx), idx * 750))
    setTimeout(() => {
      const added = 4 + Math.floor(Math.random() * 9)
      setSyncing(false)
      setSyncStage(-1)
      setIndexed((c) => c + added)
      setLastSynced('just now')
      setToast(`+${added} new emails synced`)
      toastTimer.current = setTimeout(() => setToast(null), 3200)
    }, SYNC_STAGES.length * 750 + 500)
  }, [syncing])

  const goToPhase = useCallback((i) => {
    setActiveIndex(Math.max(0, Math.min(NODE_DEFS.length - 1, i)))
  }, [])
  const prevPhase = useCallback(() => goToPhase(activeIndex - 1), [goToPhase, activeIndex])
  const nextPhase = useCallback(() => goToPhase(activeIndex + 1), [goToPhase, activeIndex])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { e.preventDefault(); send() }
  }, [send])

  const activeStageKey = syncing ? SYNC_STAGES[syncStage] : null
  const pipelineSlides = NODE_DEFS.map((nd, idx) => ({
    ...nd,
    dist: Math.abs(idx - activeIndex),
    active: (activeStageKey && nd.stageKey === activeStageKey) || (queryActive && nd.stageKey === 'query'),
  }))

  const messagesVM = messages.map((m, i) => {
    const isUser = m.role === 'user'
    return {
      key: i,
      text: m.text,
      hasSources: m.sources && m.sources.length > 0,
      sources: m.sources || [],
      prompt: isUser ? 'you@inbox ~ %' : 'mailman ›',
      isUser,
    }
  })

  const suggestions = PRESETS.map((p) => ({ text: p.q, onPick: () => pick(p.q) }))
  const sendDisabled = !input.trim() || thinking

  return {
    dark, toggleDark,
    workspaceName,
    indexedCountLabel: indexed.toLocaleString('en-US'),
    lastSynced,
    messagesRef,
    input, setInput, onKeyDown, send: () => send(), sendDisabled,
    messages: messagesVM,
    thinking, thinkingStatus,
    suggestions,
    syncing, syncStage, startSync, syncHover,
    onSyncEnter: () => setSyncHover(true), onSyncLeave: () => setSyncHover(false),
    syncLabel: syncing ? (SYNC_LABELS[SYNC_STAGES[syncStage]] || 'Syncing…') : 'Sync',
    toast, hasToast: !!toast,
    activeIndex, pipelineSlides, nodeCount: NODE_DEFS.length,
    goToPhase, prevPhase, nextPhase,
  }
}
