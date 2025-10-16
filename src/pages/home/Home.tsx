import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-between gap-36 p-4">
      <section className="flex flex-col items-center gap-4 w-full">
        <img src="/logo.png" className="w-36" alt="Logo" />
        <h1 className="text-3xl text-black text-center">Social Pet</h1>
      </section>

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
export default Home
