// The wash behind every full-page surface in the demo.
//
// One copy: it was duplicated verbatim in four files, so a change to the app's
// backdrop meant remembering all four. Needs a positioned ancestor — every page
// here is already `relative`.
export function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: `radial-gradient(60rem 40rem at 80% -10%, var(--canvas-glow-a), transparent 60%),
          radial-gradient(50rem 35rem at -10% 110%, var(--canvas-glow-b), transparent 60%)`,
      }}
    />
  )
}
