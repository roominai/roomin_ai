import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../components/AuthProvider";
import BlurredBackground from "../components/BlurredBackground";

let title = "Roomin AI";
let description = "Redecore seu ambiente em segundos";
let ogimage = "https://roomgpt-demo.vercel.app/og-image.png";
let sitename = "roominai-six.vercel.app";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://roominai-six.vercel.app"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: "https://roominai-six.vercel.app",
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
        <BlurredBackground />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
