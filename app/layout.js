import './globals.css'

export const metadata = {
  title: 'ForgeCrew - Brotherhood Built',
  description: 'Find your crew. Build real friendships.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
