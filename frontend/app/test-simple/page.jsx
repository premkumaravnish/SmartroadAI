'use client'

import dynamic from 'next/dynamic'

const TestMap = dynamic(() => import('../../components/SimpleTestMap'), { ssr: false })

export default function TestSimplePage() {
  return (
    <div style={{ 
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0f172a',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
        color: '#fff',
        flexShrink: 0
      }}>
        <h1 style={{ margin: 0 }}>Test Map - Dynamic Import</h1>
      </div>

      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1a2340'
        }}>
          <TestMap />
        </div>
      </div>
    </div>
  )
}
