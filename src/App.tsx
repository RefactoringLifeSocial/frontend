import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/auth/login/Login"
import Register from "./pages/auth/register/Register"
import AuthLayout from "./layout/AuthLayout"
import Home from "./pages/home/Home"
import Error from "./pages/error/Error"
import PasswordRecovery from "./pages/auth/password recovery/PasswordRecovery"

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route path="" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="password-recovery" element={<PasswordRecovery />} />
          <Route path="register" element={<Register />} />
          <Route path="error" element={<Error />} />
        </Route>

        <Route path="/*" element={<Navigate to="/error" replace />} />
      </Routes>
    </main>
  )
}

export default App
