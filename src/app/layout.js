import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "Sakura Labs - Testing Playground",
  description: "Automotive RAG Chat App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} antialiased bg-[#3a3a47] text-[#ededed]`}
      >
        {children}
      </body>
    </html>
  );
}