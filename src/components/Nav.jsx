export default function Nav({ dark, toggleDark }) {
  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="nav-dot" />
        Mailman
      </div>
      <div className="nav-links">
        <a href="#pipeline">pipeline</a>
        <a href="#features">features</a>
        <a href="#cli">cli</a>
        <a href="https://github.com/whenindan/Mailman">github</a>
        <button
          className="dark-toggle"
          onClick={toggleDark}
          aria-label="Toggle dark mode"
        >
          <span className={`dark-toggle-thumb ${dark ? 'is-dark' : ''}`}>
            <svg className="dark-toggle-thumb-icon" viewBox="0 0 24 24" width="11" height="11">
              {dark ? (
                <path fill="currentColor" stroke="none" d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </>
              )}
            </svg>
          </span>
        </button>
      </div>
    </nav>
  )
}
