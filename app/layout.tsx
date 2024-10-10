import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import NavBar from "@/components/layout/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import Container from "@/components/container";
import { Toaster } from "@/components/ui/toaster";
import LocationFilter from "@/components/LocationFilter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Booking Hotels",
  description: "Book a hotel of your choice",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <main className="flx flex-col min-h-screen bg-secondary">
              <NavBar />
              <LocationFilter/>
              <section className="flex-grow">
                <Container>{children}</Container>
              </section>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
