"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

interface ManualMetricsModalProps {
  id: string;
  month: string;
  campaignName: string;
  initialLeads?: number;
  initialSales?: number;
  isUpdate?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { id: string; leads: number; sales: number }) => void;
}

export function ManualMetricsModal({
   id,
   month,
   campaignName,
   initialLeads = 0,
   initialSales = 0,
   isUpdate = false,
   open,
   onOpenChange,
   onSubmit,
 }: ManualMetricsModalProps) {

  const [leads, setLeads] = useState<number | "">(initialLeads);
  const [sales, setSales] = useState<number | "">(initialSales);

  useEffect(() => {
    if (open) {
      setLeads(initialLeads);
      setSales(initialSales);
    }
  }, [open, initialLeads, initialSales]);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    onSubmit({
      id,
      leads: Number(leads),
      sales: Number(sales),
    });

    onOpenChange(false);
  };

  const hideSpinnersClass =
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isUpdate ? "Atualizar Métricas" : "Alimentar Métricas"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da campanha <strong>{campaignName}</strong> para o mês de <strong>{month}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <FieldGroup className="space-y-6">

                {/* Campo Leads */}
                <Field className="flex flex-col gap-2">
                  <Label htmlFor="leads">Leads</Label>
                  <div className="flex items-center gap-2">
                    <Input
                        id="leads"
                        name="leads"
                        type="number"
                        min={0}
                        value={leads}
                        onChange={(e) => setLeads(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                        className={`font-medium ${hideSpinnersClass}`}
                        required
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLeads((prev) => prev === "" ? 0 : Math.max(0, prev - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLeads((prev) => prev === "" ? 1 : prev + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Field>

                {/* Campo Vendas */}
                <Field className="flex flex-col gap-2">
                  <Label htmlFor="sales">Vendas</Label>
                  <div className="flex items-center gap-2">
                    <Input
                        id="sales"
                        name="sales"
                        type="number"
                        min={0}
                        value={sales}
                        onChange={(e) => setSales(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                        className={`font-medium ${hideSpinnersClass}`}
                        required
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSales((prev) => prev === "" ? 0 : Math.max(0, prev - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setSales((prev) => prev === "" ? 1 : prev + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Field>

              </FieldGroup>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {isUpdate ? "Atualizar" : "Alimentar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}