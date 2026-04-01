import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/contexts/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FHIRGate - Cổng thông tin Bệnh án Điện tử",
  description: "Hệ sinh thái Quản lý Hồ sơ Sức khỏe chuẩn HL7 FHIR tích hợp AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="animate-fade-in">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
