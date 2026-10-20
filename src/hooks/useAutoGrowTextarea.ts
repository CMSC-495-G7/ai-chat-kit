import { useCallback, useEffect, useRef } from 'react'

type Caps = {
  /** Max height while collapsed. */
  collapsed: number
  /** Max height while expanded — a function so it can track the viewport. */
  expandedCap: () => number
}

/**
 * Grows a textarea with its content up to the active cap. When `expanded` the
 * cap can depend on the viewport, so the height is recomputed on window resize.
 * Returns the ref to attach to the textarea.
 */
export function useAutoGrowTextarea(value: string, expanded: boolean, caps: Caps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    if (!value) return
    const cap = expanded ? caps.expandedCap() : caps.collapsed
    el.style.height = `${Math.min(el.scrollHeight, cap)}px`
  }, [value, expanded, caps])

  useEffect(() => {
    resize()
  }, [resize])

  // Keep the expanded height in step with viewport resizes.
  useEffect(() => {
    if (!expanded) return
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [expanded, resize])

  return ref
}
