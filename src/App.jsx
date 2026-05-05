// this is App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import { AuthProvider } from './context/Auth.jsx'
import { PageProvider } from './context/PageContext.jsx'

import PrivateRoute from './route/privateRoute.jsx'
import GuestRoute from './route/guestRoute.jsx'

import Login from './component/Login.jsx'
import Register from './component/Register.jsx'
import Dashboard from './layout/Dashboard.jsx'
import './App.css'

function App() {

  return (
    <AuthProvider>
      <PageProvider>
        <Router>
          <Routes>

            <Route path='/' element={<Navigate to='/login' />} />
            <Route path='/login' element={
              <GuestRoute>
                <Login/>
              </GuestRoute>
              } />

            <Route path='/register' element={<Register/>} />

            <Route path='/dashboard' element={
              <PrivateRoute>
                <Dashboard/>
              </PrivateRoute>
              } />
          </Routes>
        </Router>
      </PageProvider>
    </AuthProvider>
  )
}

export default App
