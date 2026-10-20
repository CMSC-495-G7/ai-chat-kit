import { useEffect, useRef, useState } from 'react'
import { parseAsync, renderDocument } from 'docx-preview'
import type { DocumentRendererProps } from '../types'

// A Word file is drawn as HTML, so rather than shrinking a fixed page to fit a
// narrow panel it reflows to the panel's width and keeps its text at reading
// size. That gives up page fidelity — no page breaks, no running headers —
// which is the right trade for a preview: the file itself is one click away.
const OPTIONS = {
  inWrapper: false,
  ignoreWidth: true,
  ignoreHeight: true,
  breakPages: false,
  renderHeaders: false,
  renderFooters: false,
}

// docx-preview leaves each section bare when it isn't given its own wrapper,
// and writes the file's page margins on it inline — an inch a side, which in a
// narrow panel is most of the width. So the sheet is dressed here, and the
// margins overridden. A wide table scrolls inside its section instead of
// being cut off.
const SHEET =
  '[&_section.docx]:overflow-x-auto! [&_section.docx]:bg-white [&_section.docx]:p-7! [&_section.docx]:shadow-sm [&_section.docx]:ring-1 [&_section.docx]:ring-line [&_section.docx+section.docx]:mt-4'

async function fetchFile(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.blob()
}

/**
 * A Word document as one continuous sheet. `zoom` scales the text and the
 * sheet reflows around it, so there is never a sideways scroll to chase.
 */
export default function DocxDocument({
  src,
  zoom,
  pending,
  onLoad,
  onError,
}: DocumentRendererProps) {
  const sheet = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const abort = new AbortController()
    const draw = async () => {
      const data = typeof src === 'string' ? await fetchFile(src, abort.signal) : src
      // Built off-screen and placed in one step, so a second run of this
      // effect can't interleave two documents in the same node. The nodes
      // include the file's own <style> tags, scoped by docx-preview's classes.
      const nodes = await renderDocument(await parseAsync(data, OPTIONS), OPTIONS)
      if (abort.signal.aborted) return
      sheet.current?.replaceChildren(...nodes)
      setReady(true)
      onLoad({})
    }
    draw().catch((error) => {
      if (!abort.signal.aborted) onError(error)
    })
    return () => abort.abort()
  }, [src, onLoad, onError])

  return (
    <>
      {!ready && pending}
      <div className="p-4" hidden={!ready}>
        <div ref={sheet} style={{ zoom }} className={SHEET} />
      </div>
    </>
  )
}
