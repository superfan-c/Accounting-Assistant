import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface WelcomeProps {
  onDone: () => void
}

export default function Welcome({ onDone }: WelcomeProps) {
  const [seconds, setSeconds] = useState(3)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((s) => s - 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (seconds <= 0) {
      onDone()
      navigate('/', { replace: true })
    }
  }, [seconds, onDone, navigate])

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <div className="welcome-emoji">📒</div>
        <h1>开始记账吧！</h1>
        <p>{seconds} 秒后进入应用</p>
      </div>
    </div>
  )
}
