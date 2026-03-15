import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './components/home/Home'
import Products from './components/products/Products'
import GlobalLoader from './components/GlobalLoader'
import About from './components/About'
import Contact from './components/Contact'
import Navbar from './components/shared/Navbar'
import Cart from './components/cart/Cart'

function App() {
  return (
    <div>
      <GlobalLoader />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  )
}

export default App
