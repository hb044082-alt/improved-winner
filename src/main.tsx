import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import './index.css'

interface CountryFlag {
  id: string
  name: string
  flag: string
  code: string
}

interface VpnStatus {
  connected: boolean
  activeCountry: CountryFlag | null
  ipAddress: string | null
  connectionTimeMs: number | null
}

let vpnState: VpnStatus = {
  connected: false,
  activeCountry: null,
  ipAddress: null,
  connectionTimeMs: null,
}

const COUNTRIES: CountryFlag[] = [
  { id: '1', name: 'United States', flag: '🇺🇸', code: 'US' },
  { id: '2', name: 'United Kingdom', flag: '🇬🇧', code: 'UK' },
  { id: '3', name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { id: '4', name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { id: '5', name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { id: '6', name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { id: '7', name: 'France', flag: '🇫🇷', code: 'FR' },
  { id: '8', name: 'Singapore', flag: '🇸🇬', code: 'SG' },
  { id: '9', name: 'Brazil', flag: '🇧🇷', code: 'BR' },
  { id: '10', name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
]

// Helper function to sleep (simulate network latency)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'api/vpn/countries',
        loader: async () => COUNTRIES,
      },
      {
        path: 'api/vpn/status',
        loader: async () => vpnState,
      },
      {
        path: 'api/vpn/connect',
        action: async ({ request }) => {
          const formData = await request.formData()
          const countryId = formData.get('countryId')
          const customSleepMs = Number(formData.get('sleepMs')) || 1500

          const startTime = performance.now()
          await sleep(customSleepMs) // Simulated delay time
          const endTime = performance.now()

          const target = COUNTRIES.find((c) => c.id === countryId) || COUNTRIES[0]
          const elapsed = Math.round(endTime - startTime)

          vpnState = {
            connected: true,
            activeCountry: target,
            ipAddress: `10.${Math.floor(Math.random() * 254 + 1)}.${Math.floor(Math.random() * 254 + 1)}.${Math.floor(Math.random() * 254 + 1)}`,
            connectionTimeMs: elapsed,
          }
          return vpnState
        },
      },
      {
        path: 'api/vpn/disconnect',
        action: async ({ request }) => {
          const formData = await request.formData()
          const customSleepMs = Number(formData.get('sleepMs')) || 800

          await sleep(customSleepMs) // Simulated teardown delay time

          vpnState = {
            connected: false,
            activeCountry: null,
            ipAddress: null,
            connectionTimeMs: null,
          }
          return vpnState
        },
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
