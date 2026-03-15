import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminNav from "@/components/AdminNav";
import { ErrorAlert } from "./ErrorAlert";

interface AdminPageShellProps {
  children: ReactNode;
  error?: string | null;
  hideNav?: boolean;
}

export function AdminPageShell({ children, error, hideNav = false }: AdminPageShellProps) {
  return (
    <div className="selection:bg-primary/20 min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 flex-1 w-full">
        {!hideNav && <AdminNav />}
        <ErrorAlert message={error || null} />
        {children}
      </main>
      <Footer />
    </div>
  );
}
