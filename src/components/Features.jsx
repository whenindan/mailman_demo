import { FEATURES } from '../useDemo'

export default function Features() {
  return (
    <section id="features" className="features-section">
      <h2>Built to stay out of the cloud</h2>
      <div className="features-grid">
        {FEATURES.map((f) => (
          <div className="feature" key={f.tag}>
            <div className="feature-tag">{f.tag}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-body">{f.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
