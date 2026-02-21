'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function DiagnosticsPage() {
  const [status, setStatus] = useState('Loading...')
  const [reports, setReports] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const diagnose = async () => {
      try {
        setStatus('✅ Page loaded')
        
        // Test backend connection
        const response = await axios.get('http://localhost:5000/reports')
        setReports(response.data)
        
        setStatus('✅ Backend reachable - Map components should work')
      } catch (err) {
        setError(err.message)
        setStatus('❌ Backend error: ' + err.message)
      }
    }
    
    diagnose()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', color: '#fff', backgroundColor: '#0f172a' }}>
      <h1>🔍 Diagnostics</h1>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#1a2340', borderRadius: '8px' }}>
        <p><strong>Status:</strong> {status}</p>
        {error && <p style={{ color: '#ff6b6b' }}><strong>Error:</strong> {error}</p>}
        {reports && <p><strong>Reports loaded:</strong> {reports.length} potholes found</p>}
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#1a2340', borderRadius: '8px' }}>
        <h3>Component Status:</h3>
        <ul>
          <li>✅ Diagnostics page renders</li>
          <li>✅ React environment working</li>
          <li>✅ Axios available</li>
          {reports && <li>✅ Backend API working</li>}
          {!reports && error && <li>❌ Backend API failed</li>}
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/navigate" style={{ color: '#06B6D4', textDecoration: 'underline' }}>
          Go back to Navigate page
        </a>
      </div>
    </div>
  )
}
