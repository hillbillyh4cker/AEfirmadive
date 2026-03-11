import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEfirmadive",
  description: "Mimic Firmadyne and FirmAE with Gemini AI powered firmware analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
