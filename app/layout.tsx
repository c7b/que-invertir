import type { Metadata, Viewport } from "next";
import "./globals.css";

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

// Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL('https://queinvertir.com'),
  title: "¿Qué Invertir? - Comparador de Rendimientos en México",
  description: "Compara tasas de rendimiento de CETES, Nu, Finsus, SuperTasas, Stori, Klar y Covalto en tiempo real. Encuentra la mejor inversión con datos actualizados diariamente.",
  keywords: "inversiones, CETES, Nu, Finsus, SuperTasas, Stori, Klar, Covalto, rendimientos, tasas, ahorro, México, finanzas personales, inversión fija, pagarés",
  authors: [{ name: "Cristobal A. | Inversionero.com" }],
  creator: "Cristobal A.",
  publisher: "Inversionero.com",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
  },
  openGraph: {
    title: "¿Qué Invertir? - Comparador de Rendimientos en México",
    description: "Compara tasas de rendimiento de CETES, Nu, Finsus, SuperTasas, Stori, Klar y Covalto en tiempo real",
    url: "https://queinvertir.com",
    siteName: "¿Qué Invertir?",
    locale: "es_MX",
    type: "website",
    images: [{
      url: "/icon-512x512.png",
      width: 512,
      height: 512,
      alt: "¿Qué Invertir? Logo"
    }],
  },
  twitter: {
    card: "summary",
    title: "¿Qué Invertir? - Comparador de Rendimientos en México",
    description: "Compara tasas de rendimiento de CETES, Nu, Finsus, SuperTasas, Stori, Klar y Covalto en tiempo real",
    images: ["/icon-512x512.png"],
    site: "@inversionero",
    creator: "@inversionero",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192" }
    ],
    shortcut: ["/favicon.ico"],
  },
  alternates: {
    canonical: "https://queinvertir.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3146279540213794" />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
