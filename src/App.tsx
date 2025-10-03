import { Route, Routes } from "react-router-dom"
import Login from "./pages/Login"

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<h1>Social pet!</h1>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </main>
  )
}

export default App
