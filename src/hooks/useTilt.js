import { useEffect } from 'react'

/**
 * useTilt — attaches a subtle 3D pointer-tilt to every element carrying a
 * `data-tilt` attribute. It writes two CSS custom properties (`--rx`, `--ry`)
 * plus a glare position (`--mx`, `--my`) that the stylesheet turns into a
 * perspective transform, so the heavy lifting stays on the compositor.
 *
 * Disabled for touch devices and when the user prefers reduced motion, and it
 * uses a single MutationObserver so dynamically-added tilt targets (cards that
 * arrive from the API) are picked up automatically.
 */
const useTilt = () => {
  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches

    if (reduce || coarse) return undefined

    const onMove = (event) => {
      const el = event.currentTarget
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      const max = Number(el.dataset.tilt) || 7
      el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`)
      el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`)
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
    }

    const onLeave = (event) => {
      const el = event.currentTarget
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }

    const attach = (el) => {
      if (el.__tiltReady) return
      el.__tiltReady = true
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
    }

    const SELECTOR = '[data-tilt],[data-glare]'

    const scan = (root) => {
      if (!root || root.nodeType !== 1) return
      if (root.matches(SELECTOR)) attach(root)
      if (root.querySelectorAll) root.querySelectorAll(SELECTOR).forEach(attach)
    }

    scan(document.body)

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach(scan))
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => mo.disconnect()
  }, [])
}

export default useTilt
