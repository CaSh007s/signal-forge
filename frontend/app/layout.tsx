import type { Metadata } from "next";
import {
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-ui" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-brand",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-report",
});

export const metadata: Metadata = {
  title: "SignalForge",
  description: "Autonomous financial research agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${ibmPlexSans.variable} font-sans bg-bg text-text-primary antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
