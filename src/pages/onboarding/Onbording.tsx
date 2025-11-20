import OnboardingLayout from "@/layout/OnboardingLayout"
import { Icon } from "@iconify/react"
import { useState } from "react"
import { Link } from "react-router-dom"

const Onboarding = () => {
  const [step, setStep] = useState(0)

  if (step === 0) {
    return (
      <main className="flex flex-col items-center justify-center w-full h-screen">
        <div className="flex flex-col gap-4 items-center justify-center py-8">
          <h2 className="text-3xl text-green-main text-center mt-6">
            Bienvenido, somos
          </h2>

          {/* Images */}
          <div className="flex gap-2">
            <div className="flex items-center justify-center w-28 h-40 mt-16 rounded-2xl shadow-gray-700 shadow-md">
              <img
                src="/onboarding/first.webp"
                alt="ilustration"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            <div className="flex items-center justify-center w-28 h-40 rounded-2xl shadow-gray-700 shadow-md">
              <img
                src="/onboarding/second.webp"
                alt="ilustration"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            <div className="flex items-center justify-center w-28 h-40 mt-16 rounded-2xl shadow-gray-700 shadow-md">
              <img
                src="/onboarding/third.webp"
                alt="ilustration"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center w-full -mt-16">
            <img className="w-32" src="/logo.png" alt="" />
          </div>

          {/* Description */}
          <div className="flex items-center justify-center bg-[url('/onboarding/background-description.png')] h-[130px] bg-[auto_90px] bg-center bg-no-repeat p-4">
            <p className="text-white text-xs text-center pb-2">
              Unite para ayudar a reencontrar, <br /> rescatar y dar hogar a
              quienes más <br /> lo necesitan
            </p>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            {/* Button */}
            <button
              onClick={() => setStep(1)}
              className="relative size-[74px] rounded-full bg-white flex items-center justify-center -rotate-90"
              style={{
                // Animated border
                background: `conic-gradient(#31c4e8 25%, #d1d5db 0%)`,
                transition: "background 0.4s ease",
              }}
            >
              {/* Arrow */}
              <div className="size-16 rounded-full bg-white flex items-center justify-center">
                <span className="text-5xl text-sky-main rotate-180">
                  <Icon icon="line-md:arrow-up" className="inline-block" />
                </span>
              </div>
            </button>

            {/* Has account */}
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
      <main className="flex flex-col justify-center items-center h-screen">
        <OnboardingLayout>
          <div className="flex justify-between w-36">
            <Icon icon="mdi:magnify" className="size-8" />

            <Icon
              icon="mdi:plus"
              className="size-8"
              onClick={() => setStep(0)}
            />
          </div>

          <h3 className="text-[28px]">Buscá o reportá</h3>

          <p className="text-center font-light">
            Podés buscar a tu mascota o <br /> reportar una perdida <br />
            fácilmente.
          </p>
        </OnboardingLayout>

        <div className="flex flex-col gap-2 items-center justify-center">
          {/* Button */}
          <button
            onClick={() => setStep(2)}
            className="relative size-[74px] rounded-full bg-white flex items-center justify-center -rotate-90"
            style={{
              // Animated border
              background: `conic-gradient(#31c4e8 50%, #d1d5db 0%)`,
              transition: "background 0.4s ease",
            }}
          >
            {/* Arrow */}
            <div className="size-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-5xl text-sky-main rotate-180">
                <Icon icon="line-md:arrow-up" className="inline-block" />
              </span>
            </div>
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={() => setStep(4)}
          className="text-start md:text-center text-sm font-medium text-gray-600 mt-4"
        >
          Saltar
        </button>
      </main>
    )
  }

  if (step === 2) {
    return (
      <main className="flex flex-col justify-center items-center h-screen">
        <OnboardingLayout>
          <h3 className="text-[26px] md:text-[28px] text-center">
            Conectá con <br /> fundaciones y hogares <br /> temporales
          </h3>

          <p className="text-center font-light">
            Encontrá apoyo y difundi casos <br /> cerca de tu zona.
          </p>
        </OnboardingLayout>

        <div className="flex flex-col gap-2 items-center justify-center -mt-10 md:mt-0">
          {/* Button */}
          <button
            onClick={() => setStep(3)}
            className="relative size-[74px] rounded-full bg-white flex items-center justify-center -rotate-90"
            style={{
              // Animated border
              background: `conic-gradient(#31c4e8 75%, #d1d5db 0%)`,
              transition: "background 0.4s ease",
            }}
          >
            {/* Arrow */}
            <div className="size-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-5xl text-sky-main rotate-180">
                <Icon icon="line-md:arrow-up" className="inline-block" />
              </span>
            </div>
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={() => setStep(3)}
          className="text-start md:text-center text-sm font-medium text-gray-600 mt-4"
        >
          Saltar
        </button>
      </main>
    )
  }

  if (step === 3) {
    return (
      <main className="flex flex-col justify-center items-center h-screen">
        <OnboardingLayout>
          <h3 className="text-[26px] md:text-[28px] text-center">
            Tu proxima historia <br /> comienza con una <br /> huella
          </h3>

          <p className="text-center font-light">
            Creá tu perfil y sumate a <br /> quienes hacen la diferencia.
          </p>
        </OnboardingLayout>

        <div className="flex flex-col gap-2 items-center justify-center w-80 -mt-10 md:mt-0">
          {/* Button */}
          <button
            onClick={() => setStep(4)}
            className="w-full h-14 bg-violet-main hover:bg-violet-main/80 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-500"
          >
            Empezar
          </button>
        </div>
      </main>
    )
  }

  if (step === 4) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:p-8">
        <div className="w-full min-h-screen flex flex-col justify-center items-center md:block md:min-h-0 md:max-w-md bg-white md:rounded-2xl md:shadow-xl">
          <section className="flex flex-col gap-4 text-center w-full p-4">
            {/* Logo */}
            <div className="flex items-center justify-center w-full mt-6">
              <img className="w-32" src="/logo.png" alt="Logo" />
            </div>

            <div className="flex flex-col gap-8">
              <Link
                to="/login"
                className="w-full h-11 bg-violet-main hover:bg-violet-main/80 shadow shadow-gray-500 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="w-full h-11 border-4 border-violet-main hover:bg-violet-main hover:text-white shadow shadow-gray-500 text-violet-main font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Registrarse
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
