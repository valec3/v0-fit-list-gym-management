"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentFormData, Member } from "@/lib/types";
import { mockMembershipTypes } from "@/lib/db-client";

type Membership = any;

export default function PaymentFormDialog({
  onCreate,
}: {
  onCreate: (data: PaymentFormData) => Promise<any> | any;
}) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [formData, setFormData] = useState<PaymentFormData>({
    member_id: "",
    amount: 0,
    payment_method: "cash",
    payment_date: new Date().toISOString().split("T")[0],
    concept: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await onCreate(formData);
      setOpen(false);
    } catch (err) {
      // swallow: hook will set error state if needed
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    async function load() {
      try {
        const [mRes, msRes] = await Promise.all([
          fetch("/api/members", { cache: "no-store" }),
          fetch("/api/memberships", { cache: "no-store" }),
        ]);
        if (!mRes.ok || !msRes.ok) return;
        const mJson = await mRes.json();
        const msJson = await msRes.json();
        if (mounted) {
          setMembers(mJson.data || []);
          setMemberships(msJson.data || []);
        }
      } catch (e) {
        // ignore load errors for now
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [open]);

  // when membership selected, try to autofill amount and concept
  useEffect(() => {
    if (!formData.membership_id) return;
    const m = memberships.find((x) => x.id === formData.membership_id);
    if (!m) return;
    // try membership.denormalized membership_type or fall back to mock types
    const mt =
      m.membership_type ||
      mockMembershipTypes.find((t) => t.id === m.membership_type_id);
    if (mt && typeof mt.price === "number") {
      setFormData((prev) => ({ ...prev, amount: mt.price }));
    }
    if (mt && mt.name) {
      setFormData((prev) => ({ ...prev, concept: `Membresía ${mt.name}` }));
    }
  }, [formData.membership_id, memberships]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">Registrar Pago</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Registra un nuevo pago en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Socio (opcional)</Label>
              <Select
                value={formData.member_id}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    member_id: v === "__none" ? "" : v,
                    membership_id: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un socio (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">-- Sin socio --</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.member_id ? (
              <div className="space-y-2">
                <Label>Membresía vinculada (opcional)</Label>
                <Select
                  value={formData.membership_id || ""}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      membership_id: v === "__none" ? "" : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una membresía (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">-- No vincular --</SelectItem>
                    {memberships
                      .filter(
                        (ms) =>
                          ms.member_id === formData.member_id && !ms.deleted
                      )
                      .map((ms) => {
                        const type =
                          (ms as any).membership_type ||
                          mockMembershipTypes.find(
                            (t) => t.id === ms.membership_type_id
                          );
                        return (
                          <SelectItem key={ms.id} value={ms.id}>
                            {type?.name ?? ms.membership_type_id} (
                            {ms.start_date} → {ms.end_date})
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  required
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Método de Pago *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, payment_method: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Concepto *</Label>
              <Input
                required
                value={formData.concept}
                onChange={(e) =>
                  setFormData({ ...formData, concept: e.target.value })
                }
                placeholder="Ej: Membresía Premium - Mensual"
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
