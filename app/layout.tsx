import type { Metadata } from "next";
import { EB_Garamond, Lato, Lexend } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Portal AUA",
  description: "Portal academico de Centro de Estudios Juridicos AUA",
};

const headingFont = EB_Garamond({
  variable: "--font-heading",
  display: "swap",
  subsets: ["latin"],
});

const bodyFont = Lato({
  variable: "--font-body",
  display: "swap",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const displayFont = Lexend({
  variable: "--font-display",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
