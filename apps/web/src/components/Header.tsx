import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  return (
    <>
      <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter uppercase text-primary drop-shadow-[1px_1px_0px_var(--color-secondary)] transition-transform hover:scale-105"
          >
            talasalita
          </Link>
          <AuthButton />
        </div>
      </header>
      <Separator />
    </>
  );
}
