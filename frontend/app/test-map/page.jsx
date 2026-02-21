'use client'

import dynamic from 'next/dynamic'

// Simple test without dynamic import
export default function TestMapPage() {
  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#0f172a' }}>
      <h1 style={{ color: '#fff', padding: '20px' }}>Map Test</h1>
      
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 100px)',
        backgroundColor: '#1a2340',
        border: '2px solid #06B6D4'
      }}>
        <MapTest />
      </div>
    </div>
  )
}

function MapTest() {
  return (
    <LeafletMap />
  )
}

// Inline Leaflet test
function LeafletMap() {
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    console.log('MapTest: Mounted')
    console.log('Container:', containerRef.current)
    console.log('Container height:', containerRef.current?.offsetHeight)
  }, [])

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: '#0a1628',
        border: '1px dashed #06B6D4'
      }}
    >
      <div style={{ color: '#fff', padding: '20px' }}>
        Testing map container height...
      </div>
    </div>
  )
}

import React from 'react'
