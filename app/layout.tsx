import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./components/ClientLayout";
import { SoundProvider } from "./components/SoundProvider";
import { ToastProvider } from "./components/Toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "atanas kyurkchiev",
  description: "software developer portfolio",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} font-sans text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900 transition-colors md:cursor-none`}
      >
        <ToastProvider>
          <SoundProvider>
            <ClientLayout>{children}</ClientLayout>
          </SoundProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
