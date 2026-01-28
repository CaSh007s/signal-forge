import {
  Space_Grotesk,
  Inter,
  JetBrains_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

// 1. BRAND FONT (Logo)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-brand",
});

// 2. UI FONT (Default)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

// 3. LOGS FONT (Terminal)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// 4. REPORT FONT (Reading)
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-report",
});

export const metadata = {
  title: "SignalForge",
  description: "Autonomous Market Research Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
        ${inter.variable} 
        ${spaceGrotesk.variable} 
        ${jetbrainsMono.variable} 
        ${ibmPlexSans.variable} 
        font-sans antialiased bg-bg text-text-primary
      `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* WRAPPER START */}
          <AuthProvider>
            <AuthModal />
            {children}
          </AuthProvider>
          {/* WRAPPER END */}
        </ThemeProvider>
      </body>
    </html>
  );
}
