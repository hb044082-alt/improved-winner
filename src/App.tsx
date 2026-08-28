import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

interface Country {
  id: string
  name: string
  flag: string
  code: string
}

interface Status {
  connected: boolean
  activeCountry: Country | null
  ipAddress: string | null
  connectionTimeMs: number | null
}

export default function App() {
  const [countries, setCountries] = useState<Country[]>([])
  const [status, setStatus] = useState<Status>({ connected: false, activeCountry: null, ipAddress: null, connectionTimeMs: null })
  const [selectedCountry, setSelectedCountry] = useState<string>('1')
  const [sleepMs, setSleepMs] = useState<number>(1200)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const refreshData = async () => {
    const countriesRes = await fetch('/api/vpn/countries')
    const countriesData = await countriesRes.json()
    setCountries(countriesData)

    const statusRes = await fetch('/api/vpn/status')
    const statusData = await statusRes.json()
    setStatus(statusData)
  }

  useEffect(() => {
    refreshData()
    if (location.pathname === '/') {
      navigate('/api/vpn/status')
    }
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('countryId', selectedCountry)
    formData.append('sleepMs', sleepMs.toString())

    const res = await fetch('/api/vpn/connect', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setStatus(data)
    setLoading(false)
    navigate('/api/vpn/status')
  }

  const handleDisconnect = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('sleepMs', sleepMs.toString())

    const res = await fetch('/api/vpn/disconnect', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setStatus(data)
    setLoading(false)
    navigate('/api/vpn/status')
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '750px', margin: '40px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2>VPN Connection & Latency Control Panel</h2>
      
      <div style={{ background: status.connected ? '#e6f4ea' : '#fce8e6', border: `1px solid ${status.connected ? '#34a853' : '#ea4335'}`, padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          Status: {status.connected ? '🟢 Connected' : '🔴 Not Connected'}
        </h3>
        <p style={{ margin: '4px 0' }}><strong>Active Country:</strong> {status.activeCountry ? `${status.activeCountry.flag} ${status.activeCountry.name}` : 'None'}</p>
        <p style={{ margin: '4px 0' }}><strong>Generated IP (10.x.x.x):</strong> {status.ipAddress || 'Not Assigned'}</p>
        <p style={{ margin: '4px 0' }}><strong>Connection Time (ms):</strong> {status.connectionTimeMs ? `${status.connectionTimeMs} ms` : 'N/A'}</p>
      </div>

      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Simulation Controls</h4>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Select Country Flag (10 Options):</label>
          <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{ padding: '8px', fontSize: '15px', width: '240px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Simulated Sleep Latency: <strong>{sleepMs} ms</strong></label>
          <input 
            type="range" 
            min="200" 
            max="5000" 
            step="100" 
            value={sleepMs} 
            onChange={(e) => setSleepMs(Number(e.target.value))}
            style={{ width: '240px' }}
          />
        </div>

        <div>
          {status.connected ? (
            <button 
              onClick={handleDisconnect} 
              disabled={loading} 
              style={{ padding: '10px 20px', background: '#d93025', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? `Disconnecting (${sleepMs}ms)...` : 'Disconnect VPN'}
            </button>
          ) : (
            <button 
              onClick={handleConnect} 
              disabled={loading} 
              style={{ padding: '10px 20px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? `Connecting (${sleepMs}ms)...` : 'Connect VPN'}
            </button>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>React-Router API Endpoint Inspect</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={() => navigate('/api/vpn/countries')} style={{ padding: '6px 12px', cursor: 'pointer' }}>GET /api/vpn/countries</button>
          <button onClick={() => navigate('/api/vpn/status')} style={{ padding: '6px 12px', cursor: 'pointer' }}>GET /api/vpn/status</button>
        </div>
        <div style={{ background: '#202124', color: '#f1f3f4', padding: '12px', borderRadius: '6px', minHeight: '60px', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
