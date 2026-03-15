import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AuthError() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-sm">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="text-foreground text-2xl font-semibold">
              Authentication Error
            </h1>
            <p className="text-muted-foreground">
              Something went wrong during sign in. Please try again.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
