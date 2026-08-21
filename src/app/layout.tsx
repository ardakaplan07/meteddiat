import type { Metadata } from "next";
import "./globals.css"; // style.css içeriğinizi bu dosyaya aktarın

export const metadata: Metadata = {
  title: "M.E.T.E. & DDİAT Ekolü",
  description: "Mühendislik & Yapay Zeka - Otonom sistemler ve dil modelleri",
  icons: {
    icon: "/assets/mete-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Inter:wght@300;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}