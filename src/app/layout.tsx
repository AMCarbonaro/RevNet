import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Revolution Network",
  description: "Empowering grassroots political activism through crowdfunded revolutionary acts",
  keywords: "political activism, crowdfunding, revolution, democracy, grassroots",
  authors: [{ name: "Anthony M. Carbonaro" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="scanlines"></div>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
