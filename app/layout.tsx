import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400"]
});

export const metadata: Metadata = {
  title: "atanas kyurkchiev",
  description: "software developer portfolio",
  icons: {
    icon: "/logo.svg"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900 transition-colors`}>
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
