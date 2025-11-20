import type { ReactNode } from "react"

const OnboardingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex flex-col w-full text-white">
      <div
        className="flex flex-col items-center justify-center w-full h-[510px] gap-2 bg-[url('/onboarding/background.png')] bg-[320px_auto] md:bg-[360px_auto] bg-center bg-no-repeat"
   
      >
        {children}
      </div>
    </main>
  )
}
export default OnboardingLayout
