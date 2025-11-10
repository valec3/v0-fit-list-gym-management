"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  UserCheck,
  Clock,
  TrendingUp,
  Calendar,
  QrCode,
} from "lucide-react";
import useAttendance from "@/components/admin-attendance/useAttendance";
import AttendanceTable from "@/components/admin-attendance/AttendanceTable";
import AttendanceStats from "@/components/admin-attendance/AttendanceStats";
import ManualCheckInDialog from "@/components/admin-attendance/ManualCheckInDialog";

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<string>("today");

  const {
    attendances,
    loading,
    submitting,
    error,
    load,
    loadActive,
    createAttendance,
    checkOut,
    removeAttendance,
  } = useAttendance();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "En curso";
    const duration = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleManualCheckIn = () => {
    // Placeholder for manual check-in dialog or QR flow
    alert("Función de check-in manual - se implementará con el sistema de QR");
  };

  useEffect(() => {
    if (activeTab === "today") {
      const today = new Date().toISOString().split("T")[0];
      load(today);
    } else if (activeTab === "active") {
      loadActive();
    }
    // history tab will load on date change
  }, [activeTab]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Control de Asistencia
            </h1>
            <p className="text-muted-foreground">
              Registra y monitorea la asistencia de los socios
            </p>
          </div>
          <ManualCheckInDialog onCreate={createAttendance} />
        </div>

        <AttendanceStats attendances={attendances} />

        {/* Attendance Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v)}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="today">Hoy</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="active">Activos Ahora</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asistencias de Hoy</CardTitle>
                <CardDescription>
                  Registro de entradas y salidas del día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o número de socio..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <AttendanceTable
                    attendances={attendances}
                    loading={loading}
                    submitting={submitting}
                    onCheckOut={checkOut}
                    onDelete={removeAttendance}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Asistencia</CardTitle>
                <CardDescription>
                  Consulta el registro histórico de asistencias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar..." className="pl-9" />
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Socio</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Salida</TableHead>
                        <TableHead>Duración</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          Selecciona una fecha para ver el historial
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Socios Activos Ahora</CardTitle>
                <CardDescription>
                  Personas actualmente en el gimnasio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendances
                    .filter((a: any) => !a.check_out_time)
                    .map((attendance: any) => (
                      <div
                        key={attendance.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {attendance.member?.first_name ||
                              attendance.member_name}{" "}
                            {attendance.member?.last_name || ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {attendance.member?.email || "Sin email"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Entrada: {formatTime(attendance.check_in_time)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hace{" "}
                            {Math.floor(
                              (Date.now() -
                                new Date(attendance.check_in_time).getTime()) /
                                (1000 * 60)
                            )}{" "}
                            minutos
                          </p>
                        </div>
                      </div>
                    ))}
                  {attendances.filter((a: any) => !a.check_out_time).length ===
                    0 && (
                    <p className="text-center text-muted-foreground">
                      No hay socios en el gimnasio actualmente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
