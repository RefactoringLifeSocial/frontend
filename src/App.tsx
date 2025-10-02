import { Route, Routes } from "react-router-dom"

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<h1>Social pet!</h1>} />
      </Routes>
    </main>
  )
}

export default App
