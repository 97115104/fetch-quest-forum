import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="page-window flex-1 px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
