// Fenced code blocks, found the way CommonMark finds them: a line of three or
// more backticks or tildes (indented at most three spaces) opens one, and a
// line of the same character, at least as long, with nothing after it, closes
// it. A fence still open when the text runs out runs to the end — which is
// exactly the state of a block that is still streaming in.

const OPEN = /^ {0,3}(`{3,}|~{3,})/
const CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/

/**
 * Applies `fn` to the prose between fenced blocks and leaves the blocks
 * themselves untouched. `last` is true for the chunk the text ends in — so a
 * streaming-only fix-up can skip text that is really the inside of an open
 * fence.
 */
export function mapProse(text: string, fn: (prose: string, last: boolean) => string): string {
  const lines = text.split('\n')
  const out: string[] = []
  let prose: string[] = []
  let fence: string | null = null

  const flush = (last: boolean) => {
    if (prose.length) out.push(fn(prose.join('\n'), last))
    prose = []
  }

  for (const line of lines) {
    if (fence === null) {
      const open = OPEN.exec(line)
      if (open) {
        flush(false)
        fence = open[1]
        out.push(line)
      } else {
        prose.push(line)
      }
    } else {
      out.push(line)
      const close = CLOSE.exec(line)
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null
    }
  }
  flush(true)
  return out.join('\n')
}

/** Whether a fenced block, as written, has its closing line yet. */
export function isClosedFence(block: string): boolean {
  const lines = block.replace(/\n+$/, '').split('\n')
  if (lines.length < 2) return false
  const open = OPEN.exec(lines[0])
  const close = CLOSE.exec(lines[lines.length - 1])
  return !!open && !!close && close[1][0] === open[1][0] && close[1].length >= open[1].length
}
