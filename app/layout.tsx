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
  title: "¿Qué Invertir? - Comparador de Rendimientos",
  description: "Compara tasas de rendimiento de CETES, Nu y SuperTasas en tiempo real. Encuentra la mejor opción para tu inversión con datos actualizados diariamente.",
  keywords: "inversiones, CETES, Nu, SuperTasas, rendimientos, tasas, ahorro, México, finanzas personales",
  authors: [{ name: "c7bs" }],
  openGraph: {
    title: "¿Qué Invertir? - Comparador de Rendimientos",
    description: "Compara tasas de rendimiento de CETES, Nu y SuperTasas en tiempo real",
    url: "https://queinvertir.com",
    siteName: "¿Qué Invertir?",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Qué Invertir? - Comparador de Rendimientos",
    description: "Compara tasas de rendimiento de CETES, Nu y SuperTasas en tiempo real",
  },
  robots: "index, follow",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head />
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
