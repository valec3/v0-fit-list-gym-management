"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
// import mockMembers from lib only for local/dev fallback (removed for API-driven behavior)
import type { Member, MemberFormData } from "@/lib/types";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMembers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/members", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load");
        if (mounted) setMembers(json.data || []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Error cargando miembros");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMembers();

    return () => {
      mounted = false;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddMember = async (data: MemberFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to create");
      // insert new member at top
      setMembers((prev) => [json.data, ...prev]);
      setIsAddDialogOpen(false);
    } catch (e: any) {
      setError(e?.message || "Error al crear miembro");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMember = async (id: string, data: MemberFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to update");
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...json.data } : m))
      );
      setEditingMember(null);
      setIsAddDialogOpen(false);
    } catch (e: any) {
      setError(e?.message || "Error al actualizar miembro");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este socio?")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to delete");
      // remove from local state
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      setError(e?.message || "Error al eliminar miembro");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
    };
    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      suspended: "Suspendido",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Socios
            </h1>
            <p className="text-muted-foreground">
              Gestiona los miembros de tu gimnasio
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setEditingMember(null)}>
                <Plus className="h-4 w-4" />
                Nuevo Socio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <MemberForm
                onSubmit={(data) => {
                  if (editingMember) {
                    handleUpdateMember(editingMember.id, data);
                  } else {
                    handleAddMember(data);
                  }
                }}
                initialData={editingMember ?? undefined}
                isSubmitting={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Socios
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Socios Activos
              </CardTitle>
              <UserPlus className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Con membresía vigente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.status === "inactive").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Socios</CardTitle>
            <CardDescription>
              Busca y filtra los socios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o número..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="mt-6 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Cargando socios...
                      </TableCell>
                    </TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        {error ? `Error: ${error}` : "No se encontraron socios"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          {member.first_name} {member.last_name}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || "-"}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingMember(member);
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function MemberForm({
  onSubmit,
  initialData,
  isSubmitting,
}: {
  onSubmit: (data: MemberFormData) => void;
  initialData?: Member;
  isSubmitting?: boolean;
}) {
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    date_of_birth: initialData?.date_of_birth || "",
    address: initialData?.address || "",
    emergency_contact_name: initialData?.emergency_contact_name || "",
    emergency_contact_phone: initialData?.emergency_contact_phone || "",
  });

  // Reset form when initialData changes (e.g., opening edit dialog)
  useEffect(() => {
    setFormData({
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      date_of_birth: initialData?.date_of_birth || "",
      address: initialData?.address || "",
      emergency_contact_name: initialData?.emergency_contact_name || "",
      emergency_contact_phone: initialData?.emergency_contact_phone || "",
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Editar Socio" : "Nuevo Socio"}
        </DialogTitle>
        <DialogDescription>Completa la información del socio</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre *</Label>
            <Input
              id="first_name"
              required
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido *</Label>
            <Input
              id="last_name"
              required
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">
              Contacto de Emergencia
            </Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergency_contact_name: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">
              Teléfono de Emergencia
            </Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergency_contact_phone: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={!!isSubmitting}>
          {initialData
            ? "Guardar Cambios"
            : isSubmitting
            ? "Creando..."
            : "Crear Socio"}
        </Button>
      </DialogFooter>
    </form>
  );
}
