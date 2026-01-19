import './globals.css'

export const metadata = {
  title: 'ForgeCrew - Brotherhood Built',
  description: 'Find your crew. Build real friendships with guys who share your interests.',
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'ForgeCrew - Brotherhood Built',
    description: 'Find your crew. Build real friendships with guys who share your interests.',
    images: ['/logo-full.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
