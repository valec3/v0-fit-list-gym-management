"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Activity,
  CreditCard,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { mockMembershipTypes } from "@/lib/db-client";

const revenueData = [
  { month: "Ene", revenue: 12000, expenses: 5000, profit: 7000 },
  { month: "Feb", revenue: 15000, expenses: 5500, profit: 9500 },
  { month: "Mar", revenue: 18000, expenses: 6000, profit: 12000 },
  { month: "Abr", revenue: 16000, expenses: 5800, profit: 10200 },
  { month: "May", revenue: 22000, expenses: 6500, profit: 15500 },
  { month: "Jun", revenue: 25000, expenses: 7000, profit: 18000 },
];

const membershipDistribution = [
  { name: "Básico", value: 45, color: "#3b82f6" },
  { name: "Premium", value: 35, color: "#8b5cf6" },
  { name: "Elite", value: 20, color: "#06b6d4" },
];

const classPopularity = [
  { class: "Yoga", members: 45 },
  { class: "Pilates", members: 52 },
  { class: "CrossFit", members: 38 },
  { class: "Spinning", members: 61 },
  { class: "Zumba", members: 43 },
];

export default function OwnerDashboard() {
  const [members, setMembers] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [mRes, msRes, pRes, aRes] = await Promise.all([
          fetch("/api/members", { cache: "no-store" }),
          fetch("/api/memberships", { cache: "no-store" }),
          fetch("/api/payments", { cache: "no-store" }),
          fetch("/api/attendance", { cache: "no-store" }),
        ]);
        if (mounted) {
          const [mJson, msJson, pJson, aJson] = await Promise.all([
            mRes.ok ? mRes.json() : { success: false, data: [] },
            msRes.ok ? msRes.json() : { success: false, data: [] },
            pRes.ok ? pRes.json() : { success: false, data: [] },
            aRes.ok ? aRes.json() : { success: false, data: [] },
          ]);
          setMembers(mJson.data || []);
          setMemberships(msJson.data || []);
          setPayments(pJson.data || []);
          setAttendance(aJson.data || []);
        }
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Calcular KPIs desde datos reales
  const activeMembers = members.filter((m) => m.status === "active").length;
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const thisMonthRevenue = payments
    .filter((p) => {
      const paymentDate = new Date(p.payment_date);
      const now = new Date();
      return (
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const activeMemberships = memberships.filter(
    (m) => m.status === "active"
  ).length;
  const todayAttendance = attendance.filter((a) =>
    a.check_in_time?.startsWith(new Date().toISOString().split("T")[0])
  ).length;

  // Distribución de membresías desde datos reales
  const realMembershipDistribution = mockMembershipTypes
    .map((type) => {
      const count = memberships.filter(
        (m) => m.membership_type_id === type.id && m.status === "active"
      ).length;
      return {
        name: type.name,
        value: count,
        color:
          type.id === "1" ? "#3b82f6" : type.id === "2" ? "#8b5cf6" : "#06b6d4",
      };
    })
    .filter((d) => d.value > 0);

  // Ingresos por mes (últimos 6 meses) desde datos reales
  const realRevenueData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toLocaleDateString("es", { month: "short" });
    const revenue = payments
      .filter((p) => {
        const pd = new Date(p.payment_date);
        return (
          pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
        );
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return { month: monthStr, revenue };
  });

  // Asistencia por día (últimos 7 días) desde datos reales
  const realAttendanceData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count = attendance.filter((a) =>
      a.check_in_time?.startsWith(dateStr)
    ).length;
    return { day: d.toLocaleDateString("es", { weekday: "short" }), count };
  });

  // Membresías que expiran pronto
  const expiringMemberships = memberships.filter((m) => {
    if (m.status !== "active") return false;
    const end = new Date(m.end_date);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff <= 7 && diff >= 0;
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
            Dashboard del Propietario
          </h1>
          <p className="text-muted-foreground">
            Resumen financiero y operativo del gimnasio
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos del Mes
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{thisMonthRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total: €{totalRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Socios Activos
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers}</div>
              <p className="text-xs text-muted-foreground">
                Total: {members.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Membresías Activas
              </CardTitle>
              <CreditCard className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMemberships}</div>
              <p className="text-xs text-muted-foreground">
                De {memberships.length} totales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Asistencia Hoy
              </CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAttendance}</div>
              <p className="text-xs text-muted-foreground">
                Check-ins registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="members">Membresías</TabsTrigger>
            <TabsTrigger value="classes">Clases</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Últimos 6 Meses</CardTitle>
                <CardDescription>Pagos recibidos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      name="Ingresos (€)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Membresías</CardTitle>
                  <CardDescription>Membresías activas por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  {realMembershipDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={realMembershipDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {realMembershipDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay membresías activas
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen por Tipo</CardTitle>
                  <CardDescription>
                    Distribución de planes activos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realMembershipDistribution.length > 0 ? (
                      realMembershipDistribution.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            {item.value} activas
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No hay membresías activas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Asistencia Últimos 7 Días</CardTitle>
                <CardDescription>Check-ins registrados por día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={realAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" name="Check-ins" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alerts */}
        {expiringMemberships.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <CardTitle className="text-amber-900">
                  Alertas Operativas
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-amber-800">
                • {expiringMemberships.length} membresías vencen en los próximos
                7 días
              </p>
              {payments.length === 0 && (
                <p className="text-sm text-amber-800">
                  • No hay pagos registrados aún
                </p>
              )}
              {attendance.length === 0 && (
                <p className="text-sm text-amber-800">
                  • No hay asistencias registradas aún
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
