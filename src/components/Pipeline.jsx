export default function Pipeline({ demo }) {
  const { pipelineSlides, activeIndex, goToPhase, prevPhase, nextPhase, nodeCount } = demo
  const active = pipelineSlides[activeIndex]

  return (
    <section id="pipeline" className="pipeline-section">
      <div className="pipeline-inner">
        <h2>How it works</h2>
        <p className="section-sub">
          A local pipeline turns raw mail into an indexed, queryable knowledge base.
        </p>

        <div className="line-wrap">
          <button
            type="button"
            className="line-arrow"
            onClick={prevPhase}
            disabled={activeIndex === 0}
            aria-label="Previous stage"
          >‹</button>

          <div className="line">
            <div className="line-track">
              <div
                className="line-fill"
                style={{ width: `${(activeIndex / (nodeCount - 1)) * 100}%` }}
              />
              {pipelineSlides.map((it, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`line-node${idx === activeIndex ? ' is-active' : ''}${it.active ? ' is-live' : ''}`}
                  style={{ left: `${(idx / (nodeCount - 1)) * 100}%` }}
                  onClick={() => goToPhase(idx)}
                  aria-label={it.label}
                >
                  <span className="line-node-dot" />
                  <span className="line-node-num">{it.n}</span>
                  <span className="line-node-label">{it.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="line-arrow"
            onClick={nextPhase}
            disabled={activeIndex === nodeCount - 1}
            aria-label="Next stage"
          >›</button>
        </div>

        <p className="line-sub">{active.sub}</p>
      </div>
    </section>
  )
}
