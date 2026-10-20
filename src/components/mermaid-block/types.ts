export type MermaidBlockLabels = {
  drawing: string
  copy: string
  copied: string
  showDiagram: string
  showSource: string
  diagram: string
  source: string
  error: string
  unsupported: (label: string) => string
}

export type MermaidBlockProps = {
  label?: string
  labels?: Partial<MermaidBlockLabels>
  previewIntervalMs?: number
  /** Mermaid source. While `streaming`, it may stop partway through a line. */
  code: string
  /**
   * The fence is still open — more source is on its way. Only complete lines
   * are drawn, the last diagram that drew stays up while the next one is not
   * yet valid, and nothing is reported as an error until the fence closes.
   */
  streaming?: boolean
}
