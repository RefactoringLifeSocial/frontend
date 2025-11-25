import { OnboardingStep } from "@/components/onboarding/OnBoardingStep"
import { CircularProgressButton } from "@/components/ui/CircularProgessButton"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const Onboarding = () => {
  const [step, setStep] = useState(0)
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()

  // Verify if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = () => {
      const hasCompletedOnboarding = localStorage.getItem(
        "onboarding_completed"
      )
      if (hasCompletedOnboarding === "true") {
        setStep(4)
        setIsChecking(false)
      } else {
        setIsChecking(false)
      }
    }

    checkOnboarding()
  }, [navigate])

  // Save onboarding status
  useEffect(() => {
    if (step === 3) {
      localStorage.setItem("onboarding_completed", "true")
    }
  }, [step])

  // Loading state while checking onboarding status
  if (isChecking) {
    return (
      <main className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-main"></div>
        </div>
      </main>
    )
  }

  if (step === 0) {
    return (
      <main className="flex flex-col items-center w-full h-screen">
        <div className="flex flex-col items-center justify-between pt-17 md:pt-0">
          <section className="flex flex-col gap-4 md:gap-2 items-center justify-center w-full px-4">
            <h2 className="text-3xl text-green-main text-center mt-6">
              Bienvenido, somos
            </h2>

            {/* Images */}
            <div className="flex gap-2">
              {["first", "second", "third"].map((img, idx) => (
                <div
                  key={img}
                  className={`flex items-center justify-center w-28 h-40 rounded-2xl shadow-gray-700 shadow-md ${
                    idx !== 1 ? "mt-16" : ""
                  }`}
                >
                  <img
                    src={`/onboarding/${img}.webp`}
                    alt="ilustration"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              ))}
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center w-full -mt-16">
              <img className="w-32 md:w-28" src="/logo-name.svg" alt="" />
            </div>

            {/* Description */}
            <div className="flex items-center justify-center bg-[url('/onboarding/background-description.png')] w-[310px] h-[130px] bg-[auto_120px] bg-center bg-no-repeat p-4">
              <p className="text-white text-xs text-center pb-2">
                Unite para ayudar a reencontrar, <br /> rescatar y dar hogar a
                quienes más <br /> lo necesitan
              </p>
            </div>
          </section>

          <div className="flex flex-col gap-2 items-center justify-center mt-0 md:-mt-3">
            <CircularProgressButton progress={25} onClick={() => setStep(1)} />

            <Link to="/login" className="text-sm font-medium text-gray-600">
              Ya tengo una cuenta
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (step === 1) {
    return (
      <OnboardingStep
        title="Buscá o reportá"
        description="Podés buscar a tu mascota o <br /> reportar una perdida <br /> fácilmente."
        progress={50}
        onNext={() => setStep(2)}
        onSkip={() => setStep(4)}
        showIcons
      />
    )
  }

  if (step === 2) {
    return (
      <OnboardingStep
        title="Conectá con <br /> fundaciones y hogares <br /> temporales"
        description="Encontrá apoyo y difundí casos <br /> cerca de tu zona."
        progress={75}
        onNext={() => setStep(3)}
        onSkip={() => setStep(4)}
      />
    )
  }

  if (step === 3) {
    return (
      <OnboardingStep
        title="Tu próxima historia <br /> comienza con una <br /> huella"
        description="Creá tu perfil y sumate a <br /> quienes hacen la diferencia."
        progress={100}
        onNext={() => setStep(4)}
        isLastStep
      />
    )
  }

  // Login/Register
  if (step === 4) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-8">
        <div className="w-full min-h-screen flex flex-col justify-center items-center md:block md:min-h-0 md:max-w-md bg-white md:rounded-2xl md:shadow-xl">
          <section className="flex flex-col gap-16 text-center w-full p-4">
            <div className="flex items-center justify-center w-full mt-6">
              <img className="w-32" src="/logo-name.svg" alt="Logo" />
            </div>

            <div className="flex flex-col gap-8">
              <Link
                to="/login"
                className="w-full h-11 bg-violet-main hover:bg-violet-main/80 shadow shadow-gray-500 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="w-full h-11 border-4 border-violet-main hover:bg-violet-main hover:text-white shadow shadow-gray-500 text-violet-main font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Registrar
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return null
}

export default Onboarding
