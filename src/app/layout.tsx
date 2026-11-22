import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shrebian Shawarma | Fresh, Homemade, Delicious",
  description: "Order fresh, homemade Shrebian Shawarma in Lahore. Fresh • Homemade • Delicious.",
  keywords: ["Shawarma", "Shrebian Shawarma", "Lahore Shawarma", "Model Town", "Gulberg", "Kaleem Durrani"],
  icons: {
    icon: "/images/brand/shrebian-logo-transparent.png",
    shortcut: "/images/brand/shrebian-logo-transparent.png",
    apple: "/images/brand/shrebian-logo-transparent.png"
  },
  openGraph: {
    title: "Shrebian Shawarma | Fresh, Homemade, Delicious",
    description: "Fresh • Homemade • Delicious. Order Shrebian Shawarma in Lahore."
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-shrebian-bg text-shrebian-text min-h-screen flex flex-col selection:bg-shrebian-red selection:text-white">
        {children}
      </body>
    </html>
  );
}
