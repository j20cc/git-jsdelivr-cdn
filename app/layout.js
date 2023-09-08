import './globals.css'
import { app_description, app_name } from '@/utils/const'
import Script from 'next/script'
import Head from 'next/head'

export const metadata = {
  title: app_name,
  description: app_description,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Script
        id="my-script"
        dangerouslySetInnerHTML={{
          __html: `var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?ce0f4be946c87b5effa495bd3a79ffc6";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "irpu3fcu1e");`,
        }}
      />
    </html>
  )
}
