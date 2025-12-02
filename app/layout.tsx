import Link from "next/link";
import Image from "next/image";
import { SolanaProvider } from "@/components/solana-provider";
import "./globals.css";
import { WalletConnectButton } from "@/components/wallet-connect-button";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 text-white backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/assets/hydexfrontend.png"
            alt="Hydex"
            width={120}
            height={28}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <div className="flex items-center gap-3">
          <WalletConnectButton />

          <Link
            href="/menu"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 md:hidden"
            aria-label="Open menu"
          >
            Menu
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body className="min-h-screen bg-black text-white">
        <SolanaProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </SolanaProvider>
      </body>
    </html>
  );
}
