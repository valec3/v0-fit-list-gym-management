"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/member-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, QrCode, TrendingUp, Clock, Award } from "lucide-react";

export default function MemberDashboardPage() {
  const router = useRouter();
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    // Verificar sesión
    const session = localStorage.getItem("member_session");
    if (!session) {
      router.push("/member/login");
      return;
    }

    // Mock data del socio
    const sessionData = JSON.parse(session);
    setMemberData({
      name: "Juan Pérez",
      email: sessionData.email,
      membership: {
        type: "Premium",
        status: "active",
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        days_remaining: 30,
      },
      stats: {
        visits_this_month: 12,
        classes_attended: 8,
        total_visits: 156,
      },
    });
  }, [router]);

  if (!memberData) {
    return null;
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bienvenido, {memberData.name}
          </h1>
          <p className="text-muted-foreground">Email: {memberData.email}</p>
        </div>

        {/* Membership Status */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Membresía {memberData.membership.type}</CardTitle>
                <CardDescription>Estado de tu membresía actual</CardDescription>
              </div>
              <Badge variant="default" className="text-base">
                Activa
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Vence el</p>
                  <p className="font-semibold">
                    {memberData.membership.end_date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Días restantes
                  </p>
                  <p className="font-semibold">
                    {memberData.membership.days_remaining} días
                  </p>
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full">Renovar Membresía</Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visitas Este Mes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {memberData.stats.visits_this_month}
              </div>
              <p className="text-xs text-muted-foreground">
                +3 vs mes anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clases Asistidas
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {memberData.stats.classes_attended}
              </div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitas
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {memberData.stats.total_visits}
              </div>
              <p className="text-xs text-muted-foreground">Desde el inicio</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer transition-colors hover:bg-accent/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Mi Código QR</CardTitle>
                  <CardDescription>Para check-in rápido</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer transition-colors hover:bg-accent/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-3">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Reservar Clase</CardTitle>
                  <CardDescription>Ver horario disponible</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Tus últimas visitas al gimnasio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Hoy", time: "18:30", duration: "1h 45m" },
                { date: "Ayer", time: "07:00", duration: "1h 30m" },
                { date: "Hace 2 días", time: "19:00", duration: "2h 00m" },
              ].map((visit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{visit.date}</p>
                    <p className="text-sm text-muted-foreground">
                      Entrada: {visit.time}
                    </p>
                  </div>
                  <Badge variant="secondary">{visit.duration}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
