const STORAGE_KEY = 'lgc_cot_rl'
const MIN_DWELL_MS = 3_000
const MAX_PER_WINDOW = 3
const WINDOW_MS = 10 * 60 * 1_000

interface RateLimitEntry {
  ts: number
}

export interface CaptchaChallenge {
  question: string
  answer: number
}

export interface AntiSpamCheck {
  ok: boolean
  reason?: 'dwell' | 'rate' | 'captcha' | 'honeypot'
  message?: string
}

function readStore(): RateLimitEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as RateLimitEntry[]
    if (!Array.isArray(data)) return []
    return data.filter((e) => typeof e?.ts === 'number')
  } catch {
    return []
  }
}

function writeStore(entries: RateLimitEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* localStorage may be unavailable (private mode, quota) */
  }
}

export function recordSubmission(): void {
  const now = Date.now()
  const entries = readStore().filter((e) => now - e.ts < WINDOW_MS)
  entries.push({ ts: now })
  writeStore(entries)
}

export function checkRateLimit(): boolean {
  const now = Date.now()
  const recent = readStore().filter((e) => now - e.ts < WINDOW_MS)
  return recent.length < MAX_PER_WINDOW
}

export function timeUntilNextSlot(): number {
  const now = Date.now()
  const recent = readStore().filter((e) => now - e.ts < WINDOW_MS)
  if (recent.length < MAX_PER_WINDOW) return 0
  const oldest = recent[0]?.ts ?? now
  return Math.max(0, WINDOW_MS - (now - oldest))
}

export function checkDwell(openedAt: number): boolean {
  return Date.now() - openedAt >= MIN_DWELL_MS
}

export function generateCaptcha(): CaptchaChallenge {
  const a = Math.floor(Math.random() * 8) + 2
  const b = Math.floor(Math.random() * 8) + 2
  return { question: `${a} + ${b}`, answer: a + b }
}

export function verifyCaptcha(
  challenge: CaptchaChallenge,
  userInput: string | number | null | undefined,
): boolean {
  if (userInput === null || userInput === undefined) return false
  const raw = typeof userInput === 'string' ? userInput.trim() : String(userInput)
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return false
  return parsed === challenge.answer
}

export function checkHoneypot(value: string | null | undefined): boolean {
  return !value
}

export function checkSubmission(opts: {
  openedAt: number
  challenge: CaptchaChallenge
  userAnswer: string | number | null | undefined
  honeypot: string
}): AntiSpamCheck {
  if (!checkHoneypot(opts.honeypot)) {
    return { ok: false, reason: 'honeypot' }
  }
  if (!checkDwell(opts.openedAt)) {
    return {
      ok: false,
      reason: 'dwell',
      message: 'Espera unos segundos antes de enviar.',
    }
  }
  if (!checkRateLimit()) {
    const wait = Math.ceil(timeUntilNextSlot() / 60_000)
    return {
      ok: false,
      reason: 'rate',
      message: `Demasiadas solicitudes. Intenta de nuevo en ${wait} min.`,
    }
  }
  if (!verifyCaptcha(opts.challenge, opts.userAnswer)) {
    return {
      ok: false,
      reason: 'captcha',
      message: 'La respuesta de verificación es incorrecta.',
    }
  }
  return { ok: true }
}

export const ANTI_SPAM_LIMITS = {
  MIN_DWELL_MS,
  MAX_PER_WINDOW,
  WINDOW_MS,
} as const
