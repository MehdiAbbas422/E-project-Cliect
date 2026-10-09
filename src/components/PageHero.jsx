// Purpose: Reusable page banner. Renders the page title over a cover image
// (passed per page) with a dark scrim so the heading stays readable, giving
// every page a consistent, on-theme header.
const PageHero = ({ eyebrow, title, subtitle, image, children }) => (
  <div
    className="page-head banner"
    style={image ? { '--head-img': `url("${image}")` } : undefined}
  >
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
    {children}
  </div>
)

export default PageHero
