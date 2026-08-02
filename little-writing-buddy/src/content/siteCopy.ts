/** Visible site copy — warm for children, clear for teachers and parents. */

export const site = {
  name: 'Little Writing Buddy',
  /** Short line under the brand on the practice workspace. */
  tagline: 'Trace letters, get friendly feedback, and print worksheets.',
  metaDescription:
    'Little Writing Buddy helps young children practise handwriting online — trace ABC and abc letters, get friendly feedback, and print worksheets. Sponsored by the Department of Education.',
} as const

export const sponsor = {
  name: 'Department of Education',
  label: 'Sponsored by',
} as const

export const landing = {
  description:
    'A simple handwriting practice tool for young primary children. Trace uppercase and lowercase letters, get friendly feedback, and print worksheets for class or home. Sponsored by the Department of Education.',
  ctaPrimary: 'Start practising',
  navPractice: 'Practice',
  howTitle: 'How it works',
  howSteps: [
    { title: 'Pick a letter', body: 'Choose A–Z, uppercase or lowercase.' },
    { title: 'Trace it', body: 'Follow the dotted guide on the practice board.' },
    { title: 'See your score', body: 'Get feedback and tips after each try.' },
  ],
} as const

export const header = {
  practiceLabel: 'Practice space',
  backHome: 'Home',
} as const

export const auth = {
  ariaLabel: 'Account',
  signIn: 'Sign in',
  signUp: 'Sign up',
  signOut: 'Sign out',
  hello: (name: string) => `Hi, ${name}`,
  modalEyebrow: 'Account',
  signInTitle: 'Sign in',
  signUpTitle: 'Sign up',
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Password',
  haveAccount: 'Already have an account?',
  needAccount: 'New here?',
  close: 'Close',
} as const

export const httpErrors = {
  home: 'Back to home',
  securityLink: 'Security & status pages',
  pages: {
    404: {
      code: 404 as const,
      title: 'Page not found',
      summary: 'We could not find that page.',
      detail:
        'The address may be mistyped, or the page may have been moved. No private data is shown on this page.',
      securityNote:
        '404 responses use a safe, generic message so missing resources do not reveal internal paths or system details.',
    },
    500: {
      code: 500 as const,
      title: 'Something went wrong',
      summary: 'The server hit an unexpected problem.',
      detail:
        'Please try again in a moment. Technical details are hidden to protect the application.',
      securityNote:
        '500 responses never expose stack traces, database errors, or file paths to the browser.',
    },
    502: {
      code: 502 as const,
      title: 'Bad gateway',
      summary: 'A gateway or proxy could not reach the upstream service.',
      detail:
        'This is a temporary connectivity issue between services. Try again shortly.',
      securityNote:
        '502 responses stay generic so upstream hostnames and internal service errors stay private.',
    },
  },
} as const

export const securityPage = {
  title: 'Security — HTTP error handling',
  intro:
    'Little Writing Buddy uses dedicated error pages for common HTTP failures. Messages stay generic so attackers and visitors never see stack traces, secrets, or internal paths.',
  principlesTitle: 'Secure error handling',
  principles: [
    'Show only a status code and a short, user-safe message.',
    'Do not leak stack traces, SQL errors, or server file paths.',
    'Offer a clear way back to the home page.',
    'Unknown client routes render the 404 page.',
    'Unexpected React failures are caught and shown as a 500 page.',
  ],
  demosTitle: 'Demo status pages',
  demosHint: 'Open these routes to review each HTTP error page:',
  trigger500: 'Simulate a client 500 error',
  trigger500Hint: 'Throws inside React so the error boundary shows the 500 page (no stack trace in the UI).',
} as const

export const flow = {
  ariaLabel: 'Practice steps',
  step1: 'Pick a letter',
  step2: 'Trace it',
  step3: 'See your score',
} as const

export const letters = {
  eyebrow: 'Step 1',
  title: 'Choose your letter',
  nowTracing: 'Your letter',
  uppercase: 'BIG letters',
  lowercase: 'small letters',
} as const

export const practice = {
  eyebrow: 'Step 2',
  title: 'Trace it here',
  drawHere: 'Trace here',
  clearRetry: 'Clear and try again',
  checkTracing: 'See how I did',
  checking: 'Checking…',
  checkHint: 'Trace the letter first, then check your score',
  helper: (letter: string, caseLabel: string) =>
    `Trace the dotted ${letter} (${caseLabel}). You can use your finger, mouse, or stylus.`,
  status: {
    ready: 'Ready to trace',
    tracing: 'Keep tracing…',
    review: 'Nice work — here is your score',
  },
  case: {
    uppercase: 'big letter',
    lowercase: 'small letter',
  },
  canvasLabel: (letter: string) =>
    `Tracing area for letter ${letter}. Use your finger, mouse, or stylus.`,
} as const

export const feedback = {
  eyebrow: 'Step 3',
  title: 'How did you do?',
  empty: 'Choose a letter, trace it, then tap "See how I did!"',
  scoreLabel: 'Your score',
  attemptsCompleted: 'Tries today',
  bestScore: 'Best score',
  currentLetter: 'Your letter',
  onGuide: (percent: number) => `${percent}% on the lines`,
  newBadge: (emoji: string, name: string) => `New badge: ${emoji} ${name}`,
  sessionBadges: 'Your badges',
} as const

export const accuracy = {
  incomplete: 'Trace a little more of the letter, then check again!',
  great: 'Great tracing! You stayed on the lines.',
  good: 'Good job! Try to stay even closer to the dotted lines.',
  practice: 'Keep practising — follow the guide letter closely.',
  low: 'Nice try! Trace right on top of the letter lines.',
} as const

export const worksheet = {
  eyebrow: 'For teachers & parents',
  title: 'Print a worksheet',
  intro:
    'Build a paper tracing sheet for home or class. Pick letters, choose uppercase or lowercase, then print or download a PDF.',
  chooseLetters: 'Pick letters',
  letterStyle: 'Letter style',
  uppercase: 'BIG ABC',
  lowercase: 'small abc',
  both: 'Both',
  selectAll: 'All',
  clearAll: 'Clear',
  emptyPreview: 'Pick one or more letters to see your worksheet.',
  previewSubtitle: 'Handwriting tracing worksheet',
  nameField: 'Name: _______________',
  dateField: 'Date: _______________',
  instructions: (caseLabel: string, letters: string) =>
    `Trace each letter. Start with the big guide, then fill in the dotted ones. Style: ${caseLabel} · Letters: ${letters}`,
  footer: 'little-writing-buddy · Handwriting practice for young learners',
  selectLetters: 'Pick letters first',
  lettersRows: (letterCount: number, rowCount: number) =>
    `${letterCount} letter${letterCount === 1 ? '' : 's'} · ${rowCount} row${rowCount === 1 ? '' : 's'}`,
  print: 'Print',
  downloadPdf: 'Download PDF',
} as const

export const worksheetPdf = {
  subtitle: 'Handwriting tracing worksheet',
  nameField: 'Name: _________________________',
  dateField: 'Date: _________________________',
  instructions: (caseLabel: string, letters: string) =>
    `Trace each letter. Start with the large guide, then practise the dotted letters. Style: ${caseLabel} · Letters: ${letters}`,
  footer: 'little-writing-buddy · Handwriting practice for young learners',
} as const

export const session = {
  defaultFeedback: 'Choose a letter and start tracing!',
} as const
