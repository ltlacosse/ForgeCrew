import './globals.css'

export const metadata = {
  title: 'ForgeCrew - Brotherhood Built',
  description: 'Find your crew. Join local groups of men with shared interests. Poker nights, hiking trips, car meets, and more.',
  keywords: 'mens groups, male friendship, social app for men, meetup, brotherhood, poker night, hiking group, car club',
  openGraph: {
    title: 'ForgeCrew - Brotherhood Built',
    description: 'Find your crew. Join local groups of men with shared interests.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1a1512" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
