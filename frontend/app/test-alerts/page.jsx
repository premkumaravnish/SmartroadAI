'use client'

import { useState } from 'react'

export default function TestAlertsPage() {
  const [alertLevel, setAlertLevel] = useState('warning')
  const [distance, setDistance] = useState(250)
  const [severity, setSeverity] = useState('Moderate')
  const [alertCount, setAlertCount] = useState(1)

  const getAlertColor = (level) => {
    switch(level) {
      case 'critical': return '#DC143C'
      case 'high': return '#FF4500'
      case 'warning': return '#FFA500'
      default: return '#FFA500'
    }
  }

  const generateDemoAlerts = () => {
    const alerts = []
    const severities = ['Minor', 'Moderate', 'Major']
    const distances = [45, 180, 320, 450, 780]
    
    for (let i = 0; i < Math.min(alertCount, 5); i++) {
      const dist = distances[i] || 100 + (i * 100)
      const sev = severities[i % severities.length]
      const level = dist <= 100 ? 'critical' : dist <= 250 ? 'high' : 'warning'
      
      alerts.push({
        id: i,
        distance: dist,
        severity: sev,
        level: level,
        message: `${sev} pothole ahead in ${dist}m - Drive carefully!`
      })
    }
    
    return alerts
  }

  const demoAlerts = generateDemoAlerts()

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0A0A0A', 
      color: '#FFF',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #FFA500, #FF4500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🗺️ Alert System Demo
          </h1>
          <p style={{ color: '#AAA', fontSize: '16px' }}>
            Test and preview how navigation alerts will look
          </p>
          <a href="/navigate" style={{
            display: 'inline-block',
            marginTop: '15px',
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: '#FFF',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            ← Back to Navigation
          </a>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: '#1A1A1A',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px',
          border: '1px solid #333'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>🎛️ Alert Controls</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Alert Level */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#AAA' }}>
                Alert Level
              </label>
              <select 
                value={alertLevel}
                onChange={(e) => setAlertLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFF',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                <option value="critical">🔴 Critical (&lt; 100m)</option>
                <option value="high">🟠 High (100-250m)</option>
                <option value="warning">🟡 Warning (250m+)</option>
              </select>
            </div>

            {/* Distance */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#AAA' }}>
                Distance: {distance}m
              </label>
              <input 
                type="range"
                min="10"
                max="1000"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Severity */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#AAA' }}>
                Pothole Severity
              </label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFF',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                <option value="Minor">🟠 Minor</option>
                <option value="Moderate">🟠 Moderate</option>
                <option value="Major">🔴 Major</option>
              </select>
            </div>

            {/* Alert Count */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#AAA' }}>
                Number of Alerts: {alertCount}
              </label>
              <input 
                type="range"
                min="1"
                max="5"
                value={alertCount}
                onChange={(e) => setAlertCount(Number(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div style={{
          backgroundColor: '#1A1A1A',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px',
          border: '1px solid #333'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>👁️ Live Preview</h2>
          
          {/* Single Custom Alert */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#AAA' }}>Custom Alert</h3>
            <div style={{
              backgroundColor: getAlertColor(alertLevel),
              color: '#FFF',
              padding: '15px 25px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <span>{severity} pothole ahead in {distance}m - Drive carefully!</span>
            </div>
          </div>

          {/* Multiple Demo Alerts */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#AAA' }}>
              Multiple Alerts ({alertCount} potholes nearby)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {demoAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: getAlertColor(alert.level),
                    color: '#FFF',
                    padding: '15px 25px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: `pulse 2s ease-in-out infinite ${alert.id * 0.2}s`
                  }}
                >
                  <span style={{ fontSize: '28px' }}>⚠️</span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Alert Levels Card */}
          <div style={{
            backgroundColor: '#1A1A1A',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📊 Alert Levels</h3>
            <div style={{ fontSize: '14px', lineHeight: '2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#DC143C', fontSize: '20px' }}>●</span>
                <span><strong>Critical:</strong> &lt; 100m away</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#FF4500', fontSize: '20px' }}>●</span>
                <span><strong>High:</strong> 100-250m away</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#FFA500', fontSize: '20px' }}>●</span>
                <span><strong>Warning:</strong> 250m+ away</span>
              </div>
            </div>
          </div>

          {/* Severity Card */}
          <div style={{
            backgroundColor: '#1A1A1A',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>⚠️ Severity Types</h3>
            <div style={{ fontSize: '14px', lineHeight: '2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#DC143C', fontSize: '20px' }}>●</span>
                <span><strong>Major:</strong> Large, dangerous</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#FF4500', fontSize: '20px' }}>●</span>
                <span><strong>Moderate:</strong> Medium size</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#FFA500', fontSize: '20px' }}>●</span>
                <span><strong>Minor:</strong> Small, manageable</span>
              </div>
            </div>
          </div>

          {/* How It Works Card */}
          <div style={{
            backgroundColor: '#1A1A1A',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>🎯 How It Works</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#AAA' }}>
              Alerts appear when you're within your set alert radius. 
              Closer potholes show first, with up to 3 simultaneous warnings.
              Sound alerts play once per pothole with 60s cooldown.
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#1A1A1A',
          borderRadius: '12px',
          border: '2px solid #4CAF50'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '15px' }}>
            Ready to Navigate? 🚗
          </h2>
          <p style={{ color: '#AAA', marginBottom: '25px', fontSize: '16px' }}>
            Start using the real navigation system with live GPS and pothole alerts
          </p>
          <a href="/navigate" style={{
            display: 'inline-block',
            padding: '16px 40px',
            backgroundColor: '#4CAF50',
            color: '#FFF',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            🗺️ Start Navigation
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(0.98); }
        }
      `}</style>
    </div>
  )
}
