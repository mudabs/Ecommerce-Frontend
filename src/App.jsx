import React, { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import Products from './components/products/Products'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/home/Home'
import Navbar from './components/shared/Navbar'
import About from './components/About'
import Contact from './components/Contact'
import { Toaster } from 'react-hot-toast'
import Cart from './components/cart/Cart'
import LogIn from './components/auth/LogIn'
import PrivateRoute from './components/PrivateRoute'
import Register from './components/auth/Register'
import Checkout from './components/checkout/Checkout'
import PaymentConfirmation from './components/checkout/PaymentConfirmation'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/dashboard/Dashboard'
import AdminProducts from './components/admin/products/AdminProducts'
import Sellers from './components/admin/sellers/Sellers'
import Category from './components/admin/categories/Category'
import Orders from './components/admin/orders/Orders'
import ProfileLayout from './components/user/ProfileLayout'
import UserOrders from './components/user/UserOrders'
import UserOrderDetails from './components/user/UserOrderDetails'
import Account from './components/user/Account'
import UserAddresses from './components/user/UserAddresses'
import UserPayments from './components/user/UserPayments'
import RouteTest from './components/RouteTest'
import ProductDetail from './components/products/ProductDetail'
import { useDispatch, useSelector } from 'react-redux'
import { getUserCart, syncUserCart } from './store/actions'
import ChatWidget from './components/chat/ChatWidget'
import Breadcrumb from './components/shared/Breadcrumb'
//import AuthDebugger from './components/AuthDebugger'

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    const isOrderConfirmationRoute =
      typeof window !== 'undefined' && window.location.pathname === '/order-confirm';

    const hydrateCart = async () => {
      try {
        const guestCartItems = (() => {
          try {
            const raw = localStorage.getItem('cartItems');
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        })();

        if (!isMounted) {
          return;
        }

        // Do not replay pre-checkout local cart items while Stripe is returning to
        // the confirmation page, or we can accidentally recreate the just-purchased cart.
        if (isOrderConfirmationRoute) {
          await dispatch(getUserCart());
        } else if (Array.isArray(guestCartItems) && guestCartItems.length > 0) {
          await dispatch(syncUserCart(guestCartItems));
        } else {
          await dispatch(getUserCart());
        }
      } catch (error) {
        console.log(error);
      }
    };

    hydrateCart();

    return () => {
      isMounted = false;
    };
  }, [dispatch, user]);

  return (
    <React.Fragment>
      <Router>
        <Navbar />
        <Breadcrumb />
        <Routes>
          <Route path='/' element={ <Home />}/>
          <Route path='/products' element={ <Products />}/>
          <Route path='/products/:productId' element={ <ProductDetail />}/>
          <Route path='/about' element={ <About />}/>
          <Route path='/contact' element={ <Contact />}/>
          <Route path='/cart' element={ <Cart />}/>
          <Route path='/test-routes' element={ <RouteTest />}/>
        
          <Route path='/' element={<PrivateRoute />}>
            <Route path='checkout' element={ <Checkout />}/>
            <Route path='order-confirm' element={ <PaymentConfirmation />}/>
          </Route>

          {/* User Profile Routes */}
          <Route path='/profile' element={<PrivateRoute />}>
            <Route element={ <ProfileLayout />}>
              <Route index element={<Navigate to='orders' replace />} />
              <Route path='orders/:orderId' element={ <UserOrderDetails />} />
              <Route path='orders' element={ <UserOrders />} />
              <Route path='account' element={ <Account />} />
              <Route path='addresses' element={ <UserAddresses />} />
              <Route path='payments' element={ <UserPayments />} />
            </Route>
          </Route>

          <Route path='/' element={<PrivateRoute publicPage />}>
            <Route path='login' element={ <LogIn />}/>
            <Route path='register' element={ <Register />}/>
          </Route>

           <Route path='/admin' element={<PrivateRoute adminOnly />}>
            <Route path='' element={ <AdminLayout />}>
              <Route path='' element={<Dashboard />} />
              <Route path='products' element={<AdminProducts />} />
              <Route path='sellers' element={<Sellers />} />
              <Route path='orders' element={<Orders />} />
              <Route path='categories' element={<Category />} />
            </Route>
          </Route>
        </Routes>
        
        {/* Debug Component - Remove in production */}
        {/* {process.env.NODE_ENV === 'development' && <AuthDebugger />} */}
        <ChatWidget />
      </Router>
      <Toaster position='bottom-center'/>
    </React.Fragment>
  )
}

export default App
