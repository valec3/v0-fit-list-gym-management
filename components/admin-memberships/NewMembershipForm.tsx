"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/types";

export default function NewMembershipForm({
  members,
  types,
  onCancel,
  onCreate,
  isSubmitting,
}: {
  members: Member[];
  types: any[];
  onCancel: () => void;
  onCreate: (payload: {
    member_id: string;
    membership_type_id: string;
    start_date: string;
    end_date: string;
    status: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [memberId, setMemberId] = useState<string>(members[0]?.id || "");
  const [typeId, setTypeId] = useState<string>(types[0]?.id || "");
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState<string>(today);

  useEffect(() => {
    if (members.length && !memberId) setMemberId(members[0].id);
  }, [members]);

  useEffect(() => {
    if (types.length && !typeId) setTypeId(types[0].id);
  }, [types]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = types.find((t) => t.id === typeId);
    const duration = type?.duration_days ?? 30;
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    await onCreate({
      member_id: memberId,
      membership_type_id: typeId,
      start_date: startDate,
      end_date: end.toISOString().split("T")[0],
      status: "active",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label>Socio</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un socio" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.first_name} {member.last_name} ({member.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de Membresía</Label>
          <Select value={typeId} onValueChange={setTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name} - €{type.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Inicio</Label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Activar Membresía"}
        </Button>
      </div>
    </form>
  );
}
