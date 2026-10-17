import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../features/home/components/Home'
import Login from '../features/auth/components/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
