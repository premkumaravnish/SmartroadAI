"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showUserLogin, setShowUserLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userLoginError, setUserLoginError] = useState('')
  const [isUserSignUp, setIsUserSignUp] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = (showLogin || showUserLogin) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showLogin, showUserLogin])

  const scrollTo = (id) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) { setLoginError('Please fill in all fields.'); return }
    window.location.href = '/admin'
    closeModal()
  }

  const handleUserLogin = (e) => {
    e.preventDefault()
    if (isUserSignUp && !userName) { setUserLoginError('Please enter your name.'); return }
    if (!userEmail || !userPassword) { setUserLoginError('Please fill in all fields.'); return }
    // Save user info to localStorage
    const userData = {
      name: isUserSignUp ? userName : (userEmail.split('@')[0]),
      email: userEmail,
      wallet: 12,
      loggedIn: true,
      joinedDate: new Date().toISOString()
    }
    localStorage.setItem('smartroad_user', JSON.stringify(userData))
    closeUserModal()
    router.push('/volunteer')
  }

  const closeModal = () => { setShowLogin(false); setLoginError(''); setEmail(''); setPassword('') }
  const closeUserModal = () => { setShowUserLogin(false); setUserLoginError(''); setUserName(''); setUserEmail(''); setUserPassword(''); setIsUserSignUp(false) }

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
            <li><Link href="/navigate" onClick={() => setMenuOpen(false)}>🗺️ Navigate</Link></li>
            <li><button onClick={() => scrollTo('upload-section')} className="nav-btn-link">Upload</button></li>
            <li><button onClick={() => scrollTo('team-section')} className="nav-btn-link">Team</button></li>
            <li>
              <button className="nav-user-btn" onClick={() => { setShowUserLogin(true); setMenuOpen(false) }}>
                <span>👤</span> User Login
              </button>
            </li>
            <li>
              <button className="nav-admin-btn" onClick={() => { setShowLogin(true); setMenuOpen(false) }}>
                <span>🔒</span> Admin Login
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Admin Login Modal */}
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

      {/* User Login Modal */}
      {showUserLogin && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-box user-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeUserModal}>✕</button>
            <div className="modal-header">
              <div className="modal-icon">🚗</div>
              <h2 className="modal-title">{isUserSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="modal-subtitle">{isUserSignUp ? 'Join SmartRoad — earn coins for reporting potholes' : 'Sign in to report potholes & earn rewards'}</p>
            </div>
            <form className="login-form" onSubmit={handleUserLogin}>
              {isUserSignUp && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="Your full name"
                    value={userName} onChange={(e) => setUserName(e.target.value)} autoComplete="name" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={userEmail} onChange={(e) => setUserEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={userPassword} onChange={(e) => setUserPassword(e.target.value)} autoComplete="current-password" />
              </div>
              {userLoginError && <div className="login-error">{userLoginError}</div>}
              <button type="submit" className="login-submit user-login-submit">
                {isUserSignUp ? 'Create Account & Start Reporting →' : 'Sign In & Report Potholes →'}
              </button>
              <div className="login-toggle">
                <span className="login-toggle-text">
                  {isUserSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
                <button type="button" className="login-toggle-btn" onClick={() => { setIsUserSignUp(!isUserSignUp); setUserLoginError('') }}>
                  {isUserSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
              <div className="user-login-benefits">
                <div className="benefit-item"><span>🪙</span> Earn SmartCoins for every report</div>
                <div className="benefit-item"><span>📊</span> Track your contributions</div>
                <div className="benefit-item"><span>🏆</span> Climb the leaderboard</div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
