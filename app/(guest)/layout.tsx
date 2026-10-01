import FloatingChat from "@/components/Bot/FloatingChat";
import Header from "@/components/guest/Header";
import Footer from "@/components/shared/Footer";
import React from "react";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-navy-950 text-cream font-body">
      <Header />
      <FloatingChat />
      {children}

      <Footer />
    </div>
  );
}
