import { flow as copy } from '../content/siteCopy'

interface StepProgressProps {
  currentStep: 1 | 2 | 3
}

const STEPS = [
  { id: 1, label: copy.step1 },
  { id: 2, label: copy.step2 },
  { id: 3, label: copy.step3 },
] as const

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <nav className="step-progress" aria-label={copy.ariaLabel}>
      <ol className="step-progress-list">
        {STEPS.map((step) => {
          const isComplete = currentStep > step.id
          const isCurrent = currentStep === step.id

          return (
            <li
              key={step.id}
              className={[
                'step-progress-item',
                isComplete ? 'complete' : '',
                isCurrent ? 'current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="step-progress-marker" aria-hidden="true">
                {isComplete ? '✓' : step.id}
              </span>
              <span className="step-progress-label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
