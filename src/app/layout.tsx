import type { Metadata, Viewport } from "next";
import { Caprasimo, DM_Sans } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Triada",
  description: "Stock, recetas, pedidos y deudas de Triada cookies.",
  appleWebApp: {
    capable: true,
    title: "Triada",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF3DC",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${caprasimo.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
