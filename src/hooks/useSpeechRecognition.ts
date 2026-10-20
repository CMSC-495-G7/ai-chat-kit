import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typing for the (prefixed) Web Speech API.
type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start(): void
  stop(): void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null
}

type Options = {
  /** Everything heard since `start`, re-sent in full each time the recognizer
   *  emits. The browser's results are cumulative, so this is the whole dictated
   *  passage, not the latest phrase: callers replace with it rather than
   *  appending, or a second sentence repeats the first. */
  onResult: (text: string) => void
}

/**
 * Wraps the browser Speech Recognition API as press-and-hold: `start` while
 * the button is down, `stop` when it comes up.
 *
 * Not a toggle. A toggle leaves the microphone on when someone forgets to
 * press it again — which is the one failure here that is not recoverable by
 * pressing something else, because by then the room has been transcribed into
 * the draft. Holding cannot be forgotten: letting go is the same gesture.
 *
 * `supported` is false where the API is unavailable, so callers can hide the
 * control entirely. The in-flight recognizer is stopped on unmount.
 */
export function useSpeechRecognition({ onResult }: Options) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const supported = useRef(getSpeechRecognition() !== null).current

  // Hold the latest callback so the recognizer's handlers never go stale.
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const start = useCallback(() => {
    // A second press while one is live would orphan the first recognizer,
    // whose onend would then switch the indicator off under the new one.
    if (recognitionRef.current) return
    const Recognition = getSpeechRecognition()
    if (!Recognition) return
    const recognition = new Recognition()
    recognition.lang = navigator.language || 'en-US'
    recognition.interimResults = false
    recognition.continuous = true
    recognition.onresult = (event) => {
      const chunk = Array.from(
        { length: event.results.length },
        (_, i) => event.results[i][0].transcript,
      )
        .join(' ')
        .trim()
      if (chunk) onResultRef.current(chunk)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [])

  return { supported, listening, start, stop }
}
