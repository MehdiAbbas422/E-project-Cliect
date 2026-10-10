import { useEffect } from 'react'

/**
 * useParallax — a lightweight scroll parallax.
 *
 * Every element with a `data-parallax="<speed>"` attribute gets a `--py` CSS
 * custom property on scroll (updated inside a requestAnimationFrame so we never
 * do layout work more than once per frame). The stylesheet shifts those layers
 * by `translate3d(0, var(--py), 0)`, which gives depth without touching the
 * scroll thread or causing re-renders.
 *
 * Skipped entirely when the user prefers reduced motion.
 */
const useParallax = () => {
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return undefined

    const elements = Array.from(document.querySelectorAll('[data-parallax]'))
    if (!elements.length) return undefined

    let ticking = false

    const update = () => {
      const y = window.scrollY
      for (const el of elements) {
        const speed = Number(el.dataset.parallax) || 0.12
        el.style.setProperty('--py', `${(y * speed).toFixed(1)}px`)
      }
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}

export default useParallax
