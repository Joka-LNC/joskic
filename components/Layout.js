import Footer from './Footer'
import Navbar from './Navbar'
import React from 'react'

const Layout = ({ children }) => (
  <div className='content'>
    <Navbar />
    {children}
    <Footer />
  </div>
)

export default Layout
