import { Icon } from "@iconify/react"
export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full flex flex-col gap-6 items-center text-center">
        <h1 className="flex items-center gap-2 text-6xl md:text-8xl font-bold text-black mb-4">
          <Icon
            icon="material-symbols:error-outline"
            className="text-red-500"
          />
          Error
        </h1>

        <h2 className="text-xl md:text-3xl font-semibold text-black mb-4">
          Al parecer hubo un error.
        </h2>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
          >
            <Icon icon="mdi:arrow-left-bold" width="20" height="20" />
            Volver atrás
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-main text-white font-semibold rounded-lg hover:bg-violet-main/80 transition-all duration-300 cursor-pointer"
          >
            <Icon icon="mdi:home" width="20" height="20" />
            Ir al inicio
          </button>
        </div>

        {/* Aditional information */}
        <p className="text-sm text-gray-500 mt-8">
          ¿Necesitas ayuda? Si tienes problemas comunicate con nosotros.
        </p>
      </div>
    </div>
  )
}
