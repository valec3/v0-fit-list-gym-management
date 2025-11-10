"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/types";

export default function MembershipsTable({
  memberships,
  members,
  types,
  loading,
  submitting,
  onRenew,
  onDelete,
  onEdit,
}: {
  memberships: any[];
  members: Member[];
  types: any[];
  loading: boolean;
  submitting: boolean;
  onRenew: (id: string, extraDays: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (id: string) => void;
}) {
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Socio</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Días Restantes</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                Cargando...
              </TableCell>
            </TableRow>
          ) : memberships.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                No hay membresías
              </TableCell>
            </TableRow>
          ) : (
            memberships.map((membership) => {
              const daysRemaining = getDaysRemaining(membership.end_date);
              const memberObj = membership.member ||
                members.find((m) => m.id === membership.member_id) || {
                  first_name: "-",
                  last_name: "",
                  email: membership.member_id,
                };
              const typeObj =
                membership.membership_type ||
                types.find((t) => t.id === membership.membership_type_id);
              return (
                <TableRow key={membership.id}>
                  <TableCell className="font-medium">
                    {memberObj.first_name} {memberObj.last_name}
                    <div className="text-xs text-muted-foreground">
                      {memberObj.email || "Sin email"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeObj?.name ?? membership.membership_type_id}
                  </TableCell>
                  <TableCell>{membership.start_date}</TableCell>
                  <TableCell>{membership.end_date}</TableCell>
                  <TableCell>
                    <span
                      className={
                        daysRemaining <= 7 ? "text-destructive font-medium" : ""
                      }
                    >
                      {daysRemaining} días
                    </span>
                  </TableCell>
                  <TableCell>{membership.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onRenew(membership.id, typeObj?.duration_days ?? 30)
                        }
                        disabled={submitting}
                      >
                        Renovar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(membership.id)}
                        disabled={submitting}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
