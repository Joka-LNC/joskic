import Link from 'next/link'
import * as fcl from '@onflow/fcl'
import '../flow/config.js'
import { React, useState, useEffect } from 'react'

const Navbar = () => {
  const [user, setUser] = useState({ loggedIn: false })

  useEffect(() => {
    fcl.currentUser.subscribe(user => {
      setUser(user)
      if (user.loggedIn) {
        localStorage.setItem('userAddress', user.addr)
      } else {
        localStorage.removeItem('userAddress')
      }
    })
  }, [])

  async function handleAuthentication () {
    if (user.loggedIn) {
      fcl.unauthenticate();
    } else {
      await fcl.authenticate();
    }
    await fcl.currentUser().snapshot();
    window.location.reload();
  }

  return (
    <nav className='navbar'>
      <div className='navbar-left'>
        <Link href='/'>Home</Link>
        <Link href='/mint'>Mint</Link>
        <Link href='/collected'>Collected</Link>
      </div>
      <div className='navbar-right'>
        {
          user.loggedIn
            ?
              (
              <>
                <p>{user.addr}</p>
                <button onClick={handleAuthentication}>Log Out</button>
              </>
              )
            :
              (
              <button onClick={handleAuthentication}>Log In</button>
              )
        }
      </div>
    </nav>
  )
}

export default Navbar
