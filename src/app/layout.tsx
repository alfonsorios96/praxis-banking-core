import { SerwistProvider } from "@serwist/next/react";
import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1D4E89",
};

export const metadata: Metadata = {
  title: {
    default: "Praxis",
    template: "%s · Praxis",
  },
  description: "Banca en el teléfono.",
  applicationName: "Praxis",
  appleWebApp: {
    capable: true,
    title: "Praxis",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}
