"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Props = {
  onCreate: (payload: Record<string, any>) => Promise<any>;
};

export default function ManualCheckInDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [memberNumber, setMemberNumber] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!open) return;
    async function load() {
      try {
        const res = await fetch("/api/members", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success)
          throw new Error(json.message || "Failed to load members");
        if (mounted) setMembers(json.data || []);
      } catch (e) {
        // ignore - keep members empty
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        check_in_time: new Date().toISOString(),
      };
      // Only allow check-in for a selected member
      if (!selectedMemberId) throw new Error("No member selected");
      const m = members.find((mm) => mm.id === selectedMemberId);
      if (!m) throw new Error("Selected member not found");
      payload.member_id = m.id;
      payload.member = {
        id: m.id,
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
      };
      await onCreate(payload);
      setOpen(false);
      setMemberNumber("");
      setMemberName("");
      setSelectedMemberId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">Check-in Manual</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in Manual</DialogTitle>
          <DialogDescription>
            Registra un socio manualmente si es necesario
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="member_select">Socio</Label>
            <Select
              value={selectedMemberId ?? ""}
              onValueChange={(v) => setSelectedMemberId(v)}
            >
              <SelectTrigger id="member_select">
                <SelectValue
                  placeholder={
                    members.length > 0
                      ? "Seleccionar socio"
                      : "No hay socios disponibles"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {members.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No hay socios disponibles
                  </SelectItem>
                ) : (
                  members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.first_name} {m.last_name} — {m.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
