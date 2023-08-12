import './globals.css'
import { Inter } from 'next/font/google'
import { app_description, app_name } from '@/utils/const'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: app_name,
  description: app_description,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
