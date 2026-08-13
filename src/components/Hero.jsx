export default function Hero({ indexedCountLabel }) {
  return (
    <section className="hero">
      <div className="badge">open source · local-first email rag</div>
      <h1>Chat with your email.</h1>
      <p className="hero-sub">
        Mailman turns an MBOX export or a live Gmail sync into a searchable, chattable
        knowledge base: split, cleaned, embedded and indexed entirely on your own machine.
      </p>
      <div className="hero-stat">
        <div>
          <div className="hero-stat-num">{indexedCountLabel}</div>
          <div className="hero-stat-label">emails indexed</div>
        </div>
      </div>
    </section>
  )
}
