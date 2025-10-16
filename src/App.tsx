import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/auth/login/Login"
import AuthLayout from "./layout/AuthLayout"
import Home from "./pages/home/Home"
import Error from "./pages/error/Error"

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route path="" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="error" element={<Error />} />
        </Route>

        <Route path="/*" element={<Navigate to="/error" replace />} />
      </Routes>
    </main>
  )
}

export default App
