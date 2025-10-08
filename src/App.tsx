import { Route, Routes } from "react-router-dom"
import Login from "./pages/auth/login/Login"
import AuthLayout from "./layout/AuthLayout"

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<h1>Social pet!</h1>} />
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
