import { useLayoutEffect } from 'react'

/**
 * useScrollReveal — a single, global scroll-reveal engine.
 *
 * Instead of wrapping every element in a component (which would mean touching
 * dozens of pages), this mounts one IntersectionObserver and reveals content
 * as it enters the viewport. Elements opt in either explicitly via a
 * `data-reveal` attribute, or automatically through the shared content
 * selectors below (page banners, section headings, cards, grids, admin tabs).
 *
 * A MutationObserver keeps watching so content that arrives later from the API
 * (lists, grids) is revealed too.
 *
 * Runs in `useLayoutEffect` so the initial hidden state is applied before the
 * browser paints — this prevents any "flash of visible content" on load.
 */
const AUTO_SELECTORS = [
  '[data-reveal]',
  '.page-head.banner',
  '.section-head',
  '.container > .card',
  '.dash-top > .card',
  '.grid > .card',
  '.grid > .list-item',
  '.admin-tabs'
].join(',')

const useScrollReveal = () => {
  useLayoutEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || !('IntersectionObserver' in window)) {
      document.querySelectorAll(AUTO_SELECTORS).forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const nodes = new Set()

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )

    const tag = (el) => {
      if (nodes.has(el)) return
      nodes.add(el)
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '')

      // Stagger: derive the delay from this element's position among the
      // sibling content blocks so grids cascade instead of popping together.
      const parent = el.parentElement
      if (parent && !el.style.getPropertyValue('--d')) {
        let index = 0
        for (const child of parent.children) {
          if (child === el) break
          if (child.matches(AUTO_SELECTORS) || child.hasAttribute('data-reveal')) index += 1
        }
        if (index > 0) el.style.setProperty('--d', `${Math.min(index, 8) * 65}ms`)
      }

      io.observe(el)
    }

    const scan = (root) => {
      if (!root || root.nodeType !== 1) return
      if (root.matches(AUTO_SELECTORS)) tag(root)
      if (root.querySelectorAll) root.querySelectorAll(AUTO_SELECTORS).forEach(tag)
    }

    scan(document.body)

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach(scan))
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}

export default useScrollReveal
