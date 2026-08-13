import { COMMANDS } from '../useDemo'

export default function Cli() {
  return (
    <section id="cli" className="cli-section">
      <div className="cli-inner">
        <h2>Or drive it from the terminal</h2>
        <div className="cli-window">
          <div className="cli-titlebar">
            <span /><span /><span />
          </div>
          <div className="cli-body">
            {COMMANDS.map((c, i) => (
              <div className="cli-line" key={i}><span className="cli-prompt">$</span> {c}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
