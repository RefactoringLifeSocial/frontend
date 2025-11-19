import { Icon } from "@iconify/react"
import { useState } from "react"
import { Link } from "react-router-dom"

const Onboarding = () => {
  const [step, setStep] = useState(0)

  if (step === 0) {
    return (
      <main className="flex flex-col items-center justify-center gap-4 w-full h-screen">
        <div className="flex flex-col items-center justify-center w-full h-screen gap-8 p-4">
          <div>
            <h2>Bienvenido, somos</h2>
            <div className="flex gap-2">
              <div className="flex items-center justify-center w-28 h-40">
                <img
                  src="/onboarding/first.webp"
                  alt="ilustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="
        relative w-20 h-20 rounded-full bg-white 
        flex items-center justify-center -rotate-90
      "
              style={{
                // El borde animado
                background: `conic-gradient(#31c4e8 25%, #d1d5db 0%)`,
                transition: "background 0.4s ease", // transición suave
              }}
            >
              {/* Círculo blanco interior */}
              <div className="w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl text-sky-main">
                  <Icon icon="mdi:arrow-bottom" className="inline-block" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (step === 1) {
    ;<main className="flex flex-col items-center justify-center gap-4 w-full h-screen">
      <div
        className="flex flex-col items-center justify-center w-full h-screen gap-8 bg-[url('/onboarding/background.png')] bg-center bg-no-repeat p-4"
        style={{
          backgroundSize: "350px",
        }}
      >
        <div>
          <h2>Bienvenido, somos</h2>
          <div className="flex gap-2">
            <div className="flex items-center justify-center w-28 h-40">
              <img
                src="/onboarding/first.webp"
                alt="ilustration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="
        relative w-20 h-20 rounded-full bg-white 
        flex items-center justify-center -rotate-90
      "
            style={{
              // El borde animado
              background: `conic-gradient(#31c4e8 25%, #d1d5db 0%)`,
              transition: "background 0.4s ease", // transición suave
            }}
          >
            {/* Círculo blanco interior */}
            <div className="w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center">
              <span className="text-3xl text-sky-main">
                <Icon icon="mdi:arrow-bottom" className="inline-block" />
              </span>
            </div>
          </button>
        </div>
      </div>
    </main>
  }

  if (step === 4) {
    return (
      <main className="flex flex-col items-center justify-between p-4">
        <section className="flex flex-col gap-4 text-center w-full">
          <div className="flex flex-col gap-8">
            <Link
              to="/login"
              className="w-full h-11 bg-violet-main hover:bg-violet-main/80 shadow shadow-gray-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/register"
              className="w-full h-11 bg-violet-main hover:bg-violet-main/80 shadow shadow-gray-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Registrarse
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4">
            {/* Login with Google */}
            <button className="flex items-center justify-center p-4 rounded-full border border-gray-300 hover:bg-gray-100 transition-all duration-200">
              <Icon icon="devicon:google" className="size-10 inline-block" />
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 border-t border-gray-300 py-6 mx-4">
            Por cualquier problema comunicate con nosotros.
          </p>
        </section>
      </main>
    )
  }
  return null
}
export default Onboarding
