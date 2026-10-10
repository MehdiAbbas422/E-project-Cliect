/**
 * Backdrop — the ambient, layered page background.
 *
 * A single fixed, non-interactive layer that gives the whole site depth and
 * atmosphere without ever touching content: a masked coordinate grid, three
 * large drifting colour fields (drawn from the existing palette tokens), a soft
 * light beam and a faint film grain. Everything animates on `transform` so it
 * stays on the GPU and never interferes with scrolling or clicks.
 */
const Backdrop = () => (
  <div className="backdrop" aria-hidden="true">
    <div className="backdrop__grid" />
    <div className="backdrop__orb backdrop__orb--1" />
    <div className="backdrop__orb backdrop__orb--2" />
    <div className="backdrop__orb backdrop__orb--3" />
    <div className="backdrop__beam" />
    <div className="backdrop__noise" />
    <div className="backdrop__vignette" />
  </div>
)

export default Backdrop
