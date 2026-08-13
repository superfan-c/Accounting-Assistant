import { useId } from 'react'

interface AppLogoProps {
  size?: number
  className?: string
}

/** 记账助手品牌 Logo：账本 + 书签 + 勾选金币 */
export default function AppLogo({ size = 28, className }: AppLogoProps) {
  const uid = useId().replace(/:/g, '')
  const bg = `${uid}-bg`
  const coin = `${uid}-coin`

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={bg} x1="8" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id={coin} x1="34" y1="34" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="0.55" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${bg})`} />
      <rect x="17" y="9" width="28" height="38" rx="4" fill="#fff" fillOpacity="0.28" />
      <rect x="11" y="12" width="30" height="38" rx="4" fill="#FFF7ED" />
      <rect x="11" y="12" width="6" height="38" rx="2" fill="#5EEAD4" />
      <path d="M34 8h7v12l-3.5-2.4L34 20V8z" fill="#F59E0B" />
      <path
        d="M23 24h13M23 31h13M23 38h8"
        stroke="#C4A484"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="46.5" cy="46.5" r="13" fill={`url(#${coin})`} />
      <circle
        cx="46.5"
        cy="46.5"
        r="9.6"
        stroke="#B45309"
        strokeWidth="1.35"
        strokeOpacity="0.55"
      />
      <path
        d="M41.6 46.4l3 3.1 7-7.4"
        stroke="#FFFBEB"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
