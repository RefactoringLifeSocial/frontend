import OnboardingLayout from "@/layout/OnboardingLayout"
import { CircularProgressButton } from "../ui/CircularProgessButton"
import { Icon } from "@iconify/react"

export const OnboardingStep = ({
  title,
  description,
  progress,
  onNext,
  onSkip,
  showIcons = false,
  isLastStep = false,
}: {
  title: string
  description: string
  progress: number
  onNext: () => void
  onSkip?: () => void
  showIcons?: boolean
  isLastStep?: boolean
}) => (
  <main className="flex flex-col justify-center items-center h-screen">
    <OnboardingLayout>
      {showIcons && (
        <div className="flex justify-between w-36">
          <Icon icon="mdi:magnify" className="size-8" />
          <Icon icon="mdi:plus" className="size-8" />
        </div>
      )}

      <h3
        className="text-[26px] md:text-[28px] text-center"
        dangerouslySetInnerHTML={{ __html: title }}
      />

      <p
        className="text-center font-light"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </OnboardingLayout>

    <div className="flex flex-col gap-2 items-center justify-center w-80">
      {isLastStep ? (
        <button
          onClick={onNext}
          className="w-full h-14 bg-violet-main hover:bg-violet-main/80 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-500"
        >
          Empezar
        </button>
      ) : (
        <CircularProgressButton progress={progress} onClick={onNext} />
      )}
    </div>

    {onSkip && !isLastStep && (
      <button
        onClick={onSkip}
        className="text-start md:text-center text-sm font-medium text-gray-600 mt-4"
      >
        Saltar
      </button>
    )}
  </main>
)
