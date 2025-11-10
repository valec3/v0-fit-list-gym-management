"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
} from "lucide-react";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar miembros
  const loadMembers = async () => {
    try {
      const response = await fetch("/api/members", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMembers(data.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  // Cargar asistencias recientes
  const loadRecentCheckIns = async () => {
    try {
      const response = await fetch("/api/attendance", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Ordenar por más reciente y tomar los últimos 5
          const sorted = (data.data || [])
            .sort(
              (a: any, b: any) =>
                new Date(b.check_in_time).getTime() -
                new Date(a.check_in_time).getTime()
            )
            .slice(0, 5);
          setRecentCheckIns(sorted);
        }
      }
    } catch (error) {
      console.error("Error loading recent check-ins:", error);
    }
  };

  useEffect(() => {
    loadMembers();
    loadRecentCheckIns();
  }, []);

  // Esta función ya no se usa, todo se maneja por handleManualCheckIn con ID directo

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || loading) return;

    setLoading(true);

    try {
      const member = members.find((m) => m.id === selectedMemberId);

      if (!member) {
        setScanResult({
          success: false,
          message: "Socio no encontrado",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // Verificar estado del socio
      if (member.status !== "active") {
        setScanResult({
          success: false,
          message: "Membresía inactiva o suspendida",
          type: "warning",
          member,
        });
        setLoading(false);
        return;
      }

      // Registrar check-in en la API usando directamente el member_id
      const checkInResponse = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          check_in_time: new Date().toISOString(),
        }),
      });

      if (!checkInResponse.ok) {
        setScanResult({
          success: false,
          message: "Error al registrar check-in",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // Check-in exitoso
      setScanResult({
        success: true,
        message: "Check-in registrado exitosamente",
        type: "success",
        member,
        timestamp: new Date().toLocaleTimeString("es-ES"),
      });

      // Recargar lista de check-ins recientes
      loadRecentCheckIns();

      // Limpiar después de 3 segundos
      setTimeout(() => {
        setScanResult(null);
        setSelectedMemberId("");
        setSearchQuery("");
      }, 3000);
    } catch (error) {
      console.error("Error during manual check-in:", error);
      setScanResult({
        success: false,
        message: "Error al procesar check-in",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateQRScan = async () => {
    if (loading) return;

    setIsScanning(true);

    // Obtener un socio activo aleatorio
    try {
      const activeMembers = members.filter((m: any) => m.status === "active");

      if (activeMembers.length > 0) {
        // Seleccionar un socio aleatorio
        const randomMember =
          activeMembers[Math.floor(Math.random() * activeMembers.length)];

        // Simular delay de escaneo y hacer check-in
        setTimeout(async () => {
          setSelectedMemberId(randomMember.id);

          // Realizar check-in directamente
          try {
            const checkInResponse = await fetch("/api/attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                member_id: randomMember.id,
                check_in_time: new Date().toISOString(),
              }),
            });

            if (checkInResponse.ok) {
              setScanResult({
                success: true,
                message: "Check-in registrado exitosamente",
                type: "success",
                member: randomMember,
                timestamp: new Date().toLocaleTimeString("es-ES"),
              });
              loadRecentCheckIns();

              setTimeout(() => {
                setScanResult(null);
                setSelectedMemberId("");
              }, 3000);
            } else {
              setScanResult({
                success: false,
                message: "Error al registrar check-in",
                type: "error",
              });
            }
          } catch (error) {
            setScanResult({
              success: false,
              message: "Error al procesar check-in",
              type: "error",
            });
          } finally {
            setIsScanning(false);
            setLoading(false);
          }
        }, 1500);
      } else {
        setScanResult({
          success: false,
          message: "No hay socios activos en el sistema",
          type: "error",
        });
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Error simulating scan:", error);
      setScanResult({
        success: false,
        message: "Error al simular escaneo",
        type: "error",
      });
      setIsScanning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Escáner de Asistencia
          </h1>
          <p className="text-muted-foreground">
            Registra la entrada de socios mediante QR o número de socio
          </p>
        </div>

        {/* Scanner Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle>Control de Acceso</CardTitle>
              <CardDescription>
                Escanea el código QR o ingresa el número de socio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Scanner Simulation */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                  {isScanning ? (
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 animate-pulse text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Escaneando...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Área de escaneo
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={simulateQRScan}
                  disabled={isScanning || loading}
                >
                  <Camera className="h-4 w-4" />
                  {isScanning
                    ? "Escaneando..."
                    : loading
                    ? "Procesando..."
                    : "Simular Escaneo QR"}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O busca un socio
                  </span>
                </div>
              </div>

              {/* Member Search and Selection */}
              <form onSubmit={handleManualCheckIn} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar socio por nombre o número..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Member List */}
                  {searchQuery && (
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-background">
                      {members
                        .filter((m) => {
                          const query = searchQuery.toLowerCase();
                          return (
                            m.first_name?.toLowerCase().includes(query) ||
                            m.last_name?.toLowerCase().includes(query) ||
                            m.email?.toLowerCase().includes(query)
                          );
                        })
                        .slice(0, 10)
                        .map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              setSelectedMemberId(member.id);
                              setSearchQuery(
                                `${member.first_name} ${member.last_name}`
                              );
                            }}
                            className="flex w-full items-center justify-between p-3 text-left hover:bg-muted transition-colors border-b last:border-0"
                          >
                            <div>
                              <p className="font-medium">
                                {member.first_name} {member.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.email || "Sin email"}
                              </p>
                            </div>
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.status === "active"
                                ? "Activo"
                                : "Inactivo"}
                            </Badge>
                          </button>
                        ))}
                      {members.filter((m) => {
                        const query = searchQuery.toLowerCase();
                        return (
                          m.first_name?.toLowerCase().includes(query) ||
                          m.last_name?.toLowerCase().includes(query) ||
                          m.email?.toLowerCase().includes(query)
                        );
                      }).length === 0 && (
                        <p className="p-3 text-sm text-muted-foreground text-center">
                          No se encontraron socios
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !selectedMemberId}
                >
                  {loading ? "Procesando..." : "Registrar Check-in"}
                </Button>
              </form>

              {/* Scan Result */}
              {scanResult && (
                <Alert
                  variant={
                    scanResult.type === "error" ? "destructive" : "default"
                  }
                  className={
                    scanResult.type === "success"
                      ? "border-accent bg-accent/10"
                      : scanResult.type === "warning"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : ""
                  }
                >
                  <div className="flex items-start gap-3">
                    {scanResult.type === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    )}
                    {scanResult.type === "warning" && (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    {scanResult.type === "error" && (
                      <XCircle className="h-5 w-5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription className="font-semibold">
                        {scanResult.message}
                      </AlertDescription>
                      {scanResult.member && (
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            Socio: {scanResult.member.first_name}{" "}
                            {scanResult.member.last_name}
                          </p>
                          {scanResult.member.email && (
                            <p>Email: {scanResult.member.email}</p>
                          )}
                          {scanResult.timestamp && (
                            <p>Hora: {scanResult.timestamp}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Check-ins</CardTitle>
            <CardDescription>Registros recientes de entrada</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckIns.length > 0 ? (
              <div className="space-y-3">
                {recentCheckIns.map((record, index) => {
                  const checkInDate = new Date(record.check_in_time);
                  const now = new Date();
                  const diffMinutes = Math.floor(
                    (now.getTime() - checkInDate.getTime()) / 60000
                  );

                  let timeText = "";
                  if (diffMinutes < 1) {
                    timeText = "Ahora mismo";
                  } else if (diffMinutes < 60) {
                    timeText = `Hace ${diffMinutes} minuto${
                      diffMinutes !== 1 ? "s" : ""
                    }`;
                  } else {
                    const diffHours = Math.floor(diffMinutes / 60);
                    timeText = `Hace ${diffHours} hora${
                      diffHours !== 1 ? "s" : ""
                    }`;
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-accent/10 p-2">
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {record.member?.first_name || "N/A"}{" "}
                            {record.member?.last_name || ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.member?.email || "Sin email"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Registrado</Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {timeText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay check-ins registrados aún
              </p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Solicita al socio que muestre su código QR desde la app o su
              teléfono
            </p>
            <p>• Escanea el código QR con la cámara del dispositivo</p>
            <p>
              • Si el código no funciona, ingresa manualmente el número de socio
            </p>
            <p>
              • Verifica que el estado de la membresía sea "Activo" antes de
              permitir el acceso
            </p>
            <p>• En caso de problemas, contacta al administrador del sistema</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
