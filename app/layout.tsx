import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Que Invertir",
  description: "Tasas de rendimientos por plazo de inversión siempre actualizado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
