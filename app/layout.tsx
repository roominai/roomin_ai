import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../components/AuthProvider";

let title = "Dream Room Generator";
let description = "Generate your dream room in seconds.";
let ogimage = "https://roomgpt-demo.vercel.app/og-image.png";
let sitename = "roomGPT.io";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://roomin-3hie8os8z-roominais-projects.vercel.app"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: "https://roominaii.vercel.app",
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
