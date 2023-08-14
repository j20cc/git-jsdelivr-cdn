import './globals.css'
import { Inter } from 'next/font/google'
import { app_description, app_name } from '@/utils/const'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: app_name,
  description: app_description,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <Script
        id="show-banner"
        dangerouslySetInnerHTML={{
          __html: `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?ce0f4be946c87b5effa495bd3a79ffc6";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();`,
        }}
      />
    </html>
  )
}
