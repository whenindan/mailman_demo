export default function Terminal({ demo }) {
  const {
    workspaceName, indexedCountLabel, lastSynced,
    syncing, syncLabel, syncHover, onSyncEnter, onSyncLeave, startSync,
    messagesRef, messages, thinking, thinkingStatus,
    suggestions, input, setInput, onKeyDown, send, sendDisabled,
    toast, hasToast,
  } = demo

  return (
    <section className="terminal-section">
      <div className="term-window">
        <div className="term-titlebar">
          <div className="term-dots">
            <span style={{ background: '#ff5f56' }} />
            <span style={{ background: '#ffbd2e' }} />
            <span style={{ background: '#27c93f' }} />
          </div>
          <span className="term-titlebar-label">mailman · {workspaceName} · zsh</span>
        </div>

        <div className="term-status">
          <span>{indexedCountLabel} emails indexed · synced {lastSynced}</span>
          <div className="sync-wrap">
            <button
              className="sync-btn"
              onClick={startSync}
              onMouseEnter={onSyncEnter}
              onMouseLeave={onSyncLeave}
            >
              <span className={`sync-icon ${syncing ? 'is-syncing' : ''}`} />
              {syncLabel}
            </button>
            {syncHover && (
              <div className="popover">
                <span className="popover-arrow" />
                Pulls new mail via the Gmail API, re-runs clean → vectorize → ingest on just
                what&apos;s new, and moves the watermark forward; nothing already indexed is reprocessed.
              </div>
            )}
          </div>
        </div>

        <div ref={messagesRef} data-mm-scroll="1" className="messages">
          {messages.map((m) => (
            <div className="message" key={m.key}>
              <div className="message-text">
                <span className="message-prompt" style={{ color: m.isUser ? 'var(--term-dim)' : '#27c93f' }}>
                  {m.prompt}
                </span>{' '}
                {m.text}
              </div>
              {m.hasSources && (
                <div className="sources">
                  {m.sources.map((src, i) => (
                    <div className="source" key={i}>
                      <div className="source-head">↳ {src.from} · {src.subject} · {src.date}</div>
                      <div className="source-snippet">&quot;{src.snippet}&quot;</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="thinking">
              <div className="thinking-dots">
                <span style={{ animationDelay: '0s' }} />
                <span style={{ animationDelay: '.15s' }} />
                <span style={{ animationDelay: '.3s' }} />
              </div>
              <span className="thinking-status">{thinkingStatus}</span>
            </div>
          )}
        </div>

        <div className="suggestions">
          {suggestions.map((s, i) => (
            <button className="chip" key={i} onClick={s.onPick}>{s.text}</button>
          ))}
        </div>

        <div className="input-row">
          <span className="prompt-caret">❯</span>
          <input
            className="chat-input"
            value={input}
            onChange={setInput}
            onKeyDown={onKeyDown}
            placeholder="ask your inbox anything…"
          />
          <button className="send-btn" onClick={send} disabled={sendDisabled}>send</button>
        </div>
      </div>

      {hasToast && <div className="toast">{toast}</div>}
    </section>
  )
}
