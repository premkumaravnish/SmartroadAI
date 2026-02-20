"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showLogin ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showLogin])

  const scrollTo = (id) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) { setLoginError('Please fill in all fields.'); return }
    // Navigate to admin page which will show the login form
    window.location.href = '/admin'
    closeModal()
  }

  const closeModal = () => { setShowLogin(false); setLoginError(''); setEmail(''); setPassword('') }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <Link href="/" className="navbar-logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">SmartRoad <em>AI</em></span>
          </Link>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          </button>

          <ul className={`navbar-links ${menuOpen ? 'menu-open' : ''}`}>
            <li><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><button onClick={() => scrollTo('solution')} className="nav-btn-link">Solution</button></li>
            <li><button onClick={() => scrollTo('upload-section')} className="nav-btn-link">Upload</button></li>
            <li><button onClick={() => scrollTo('team-section')} className="nav-btn-link">Team</button></li>
            <li>
              <button className="nav-admin-btn" onClick={() => { setShowLogin(true); setMenuOpen(false) }}>
                <span>🔒</span> Admin Login
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {showLogin && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-header">
              <div className="modal-icon">🛡️</div>
              <h2 className="modal-title">Admin Portal</h2>
              <p className="modal-subtitle">Restricted — Municipal officers only</p>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="admin@smartroad.gov.in"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              {loginError && <div className="login-error">{loginError}</div>}
              <button type="submit" className="login-submit">Sign In to Dashboard →</button>
              <p className="login-note">Access is monitored and logged for security compliance.</p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
