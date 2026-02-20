'use client'

import { useEffect, useRef, useState } from 'react'

function Hero() {
  const fileInputRef = useRef(null)
  const camInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const [showUploadMenu, setShowUploadMenu] = useState(false)

  const toggleUploadMenu = () => setShowUploadMenu((s) => !s)
  const onImageClick = () => {
    setShowUploadMenu(false)
    fileInputRef.current?.click()
  }
  const onUseCamera = () => {
    setShowUploadMenu(false)
    camInputRef.current?.click()
  }

  const onVideoClick = () => {
    setShowUploadMenu(false)
    // directly open native file chooser for video
    videoInputRef.current?.click()
  }

  const handleFileSelected = (e) => {
    // If a file is chosen, scroll to the image upload section on page
    if (e.target.files && e.target.files[0]) {
      scrollTo('upload-section')
    }
  }

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="grid-overlay"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          AI-Powered Infrastructure Intelligence
        </div>
        <h1 className="hero-title">
          <span className="title-line">AI-Powered</span>
          <span className="title-line accent-gradient">Smart Road</span>
          <span className="title-line">Monitoring System</span>
        </h1>
        <p className="hero-subtitle">
          Pothole Detection & Road Damage Classification for Indian Cities —
          transforming reactive maintenance into proactive infrastructure management.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">3.5M+</span>
            <span className="stat-label">Potholes Detected</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-num">98.2%</span>
            <span className="stat-label">AI Accuracy</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-num">72hr</span>
            <span className="stat-label">Avg. Repair Time</span>
          </div>
        </div>
        <div className="hero-buttons">
          <a href="/volunteer" className="btn-primary">
            <span className="btn-icon">📤</span> Upload Image / Video
          </a>
          <button className="btn-secondary" onClick={() => scrollTo('solution')}>
            <span className="btn-icon">⬡</span> Explore Solution
          </button>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-line"></div>
        </div>
        {/* Hidden inputs to trigger file picker or camera capture */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
        />

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={camInputRef}
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Hidden video input to open native chooser for videos */}
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          onChange={(e) => {
            /* native chooser opened — user selected a video (or cancelled) */
            // no-op: we only need to open the chooser per request
          }}
          className="hidden"
        />
      </div>
    </section>
  )
}

export default Hero

// Hidden inputs placed after export (keeps component file self-contained)
