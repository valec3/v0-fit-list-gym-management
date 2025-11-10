"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  Dumbbell,
  UserCheck,
  LogOut,
  QrCode,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";

const navigation = [
  { name: "Propietario", href: "/owner", icon: LayoutDashboard },
  { name: "Socios", href: "/admin", icon: Users },
  { name: "Membresías", href: "/admin/memberships", icon: CreditCard },
  { name: "Clases", href: "/admin/classes", icon: Calendar },
  { name: "Asistencia", href: "/admin/attendance", icon: UserCheck },
  { name: "Pagos", href: "/admin/payments", icon: BarChart3 },
  // { name: "Reportes", href: "/admin/reports", icon: BarChart3 },
  { name: "Escáner QR", href: "/admin/scanner", icon: QrCode },
  // { name: "Entrenador", href: "/trainer", icon: TrendingUp },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Dumbbell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">FitList</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-5 w-5" />
              Configuración
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
