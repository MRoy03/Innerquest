import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="flex-1 pb-24 lg:pb-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
