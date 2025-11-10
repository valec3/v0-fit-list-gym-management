"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Calendar, Award, CheckCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";

export default function TrainerDashboard() {
  const [members, setMembers] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [mRes, msRes, aRes] = await Promise.all([
          fetch("/api/members", { cache: "no-store" }),
          fetch("/api/memberships", { cache: "no-store" }),
          fetch("/api/attendance", { cache: "no-store" }),
        ]);
        if (mounted) {
          const [mJson, msJson, aJson] = await Promise.all([
            mRes.ok ? mRes.json() : { success: false, data: [] },
            msRes.ok ? msRes.json() : { success: false, data: [] },
            aRes.ok ? aRes.json() : { success: false, data: [] },
          ]);
          setMembers(mJson.data || []);
          setMemberships(msJson.data || []);
          setAttendance(aJson.data || []);
        }
      } catch (e) {
        console.error("Error loading trainer dashboard data:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Calcular estadísticas desde datos reales
  const activeMembers = members.filter((m) => m.status === "active");
  const todayAttendance = attendance.filter((a) =>
    a.check_in_time?.startsWith(new Date().toISOString().split("T")[0])
  ).length;

  // Asistencia últimos 7 días
  const last7DaysAttendance = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    return attendance.filter((a) => a.check_in_time?.startsWith(dateStr))
      .length;
  });

  const avgAttendanceLast7Days =
    last7DaysAttendance.length > 0
      ? Math.round(
          last7DaysAttendance.reduce((a, b) => a + b, 0) /
            last7DaysAttendance.length
        )
      : 0;

  // Asistencia por miembro (top 10)
  const memberAttendanceCount: Record<string, number> = {};
  attendance.forEach((a) => {
    if (a.member?.id) {
      memberAttendanceCount[a.member.id] =
        (memberAttendanceCount[a.member.id] || 0) + 1;
    }
  });

  const topAttendees = Object.entries(memberAttendanceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([memberId, count]) => {
      const member = members.find((m) => m.id === memberId);
      return {
        id: memberId,
        name: member
          ? `${member.first_name} ${member.last_name}`
          : `Miembro ${memberId.substring(0, 8)}`,
        classes: count,
        level: "Active",
        joined: member?.join_date
          ? new Date(member.join_date).toLocaleDateString("es")
          : "N/A",
      };
    });

  // Asistencia por día de la semana (últimos 7 días con detalles)
  const weeklyAttendanceDetails = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayAttendance = attendance.filter((a) =>
      a.check_in_time?.startsWith(dateStr)
    );
    return {
      day: d.toLocaleDateString("es", { weekday: "long" }),
      date: d.toLocaleDateString("es", { day: "2-digit", month: "short" }),
      count: dayAttendance.length,
      isToday: dateStr === new Date().toISOString().split("T")[0],
    };
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard del Entrenador
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus clases y seguimiento de estudiantes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Socios Activos
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                Total: {members.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Asistencias Hoy
              </CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAttendance}</div>
              <p className="text-xs text-muted-foreground">
                Check-ins registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio Diario
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAttendanceLast7Days}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 días</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitas
              </CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance.length}</div>
              <p className="text-xs text-muted-foreground">Check-ins totales</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes">Asistencia Semanal</TabsTrigger>
            <TabsTrigger value="students">Socios Activos</TabsTrigger>
            <TabsTrigger value="progress">Recientes</TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Asistencia por Día (Últimos 7 Días)</CardTitle>
                <CardDescription>
                  Check-ins registrados cada día de la semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendance.length > 0 ? (
                  <div className="space-y-3">
                    {weeklyAttendanceDetails.map((day, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 ${
                          day.isToday ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">{day.day}</p>
                            <p className="text-sm text-muted-foreground">
                              {day.date}
                              {day.isToday && (
                                <Badge variant="secondary" className="ml-2">
                                  Hoy
                                </Badge>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{day.count}</p>
                            <p className="text-xs text-muted-foreground">
                              check-ins
                            </p>
                          </div>
                        </div>
                        {day.count > 0 && (
                          <div className="mt-2">
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{
                                  width: `${Math.min(
                                    (day.count /
                                      Math.max(
                                        ...weeklyAttendanceDetails.map(
                                          (d) => d.count
                                        )
                                      )) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay asistencias registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Top Socios más Activos</CardTitle>
                <CardDescription>
                  Socios con más asistencias registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topAttendees.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Check-ins</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Miembro Desde</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topAttendees.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell>{student.classes}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{student.level}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {student.joined}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay asistencias registradas aún
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Asistencias Recientes</CardTitle>
                <CardDescription>Últimos check-ins registrados</CardDescription>
              </CardHeader>
              <CardContent>
                {attendance.length > 0 ? (
                  <div className="space-y-3">
                    {attendance
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.check_in_time).getTime() -
                          new Date(a.check_in_time).getTime()
                      )
                      .slice(0, 10)
                      .map((record, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b pb-2 last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              {record.member?.first_name}{" "}
                              {record.member?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.member?.email || "Sin email"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(
                                record.check_in_time
                              ).toLocaleTimeString("es", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                record.check_in_time
                              ).toLocaleDateString("es", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay asistencias registradas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
