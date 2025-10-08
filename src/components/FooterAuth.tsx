import { Link } from "react-router-dom"
import { motion } from "motion/react"

export default function FooterAuth() {
  return (
    <footer className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center lg:flex-row lg:justify-between lg:items-start gap-8">
          <div className="flex flex-col lg:w-1/3">
            <div className="flex flex-col items-center justify-center lg:items-start">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto mb-4" />
              <h3 className="text-xl font-bold italic mb-2">
                RefactoringLifeSocial
              </h3>
              <p className="text-lg ">Plataforma de adopción de mascotas</p>
            </div>
          </div>

          <div className="flex flex-col lg:w-1/3">
            <h4 className="text-lg font-semibold mb-4">Navegación</h4>
            <nav className="flex gap-18">
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  className=" hover:text-red-main transition-colors duration-300 text-base"
                >
                  Inicio
                </Link>

                <Link
                  to="/login"
                  className=" hover:text-red-main transition-colors duration-300 text-base"
                >
                  Iniciar sesión
                </Link>
              </div>
            </nav>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center mt-8 gap-4">
          <motion.hr
            initial={{ width: 0 }}
            animate={{ width: "100%", transition: { duration: 1 } }}
            className="text-blue-secondary m-1"
          />

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <p className="text-sm">
              © 2025 RefactoringLifeSocial. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
