"use client";

import { useState } from "react"; // Adicionado para controlar os valores
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
import { FormEvent } from "react";
import { Minus, Plus } from "lucide-react"; // Importando ícones para os botões

interface ManualMetricsModalProps {
  id: string;
  month: string;
  campaignName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualMetricsModal({
                                     id,
                                     month,
                                     campaignName,
                                     open,
                                     onOpenChange,
                                   }: ManualMetricsModalProps) {
  // Estados para controlar os números
  const [leads, setLeads] = useState(0);
  const [vendas, setVendas] = useState(0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const leadsValue = formData.get("leads");
    const vendasValue = formData.get("vendas");

    console.log("Alimentando as métricas manuais: ", {
      id,
      month,
      leads: leadsValue,
      vendas: vendasValue
    });

    onOpenChange(false);
  };

  // Classe utilitária para esconder as setas nativas do HTML
  const hideSpinnersClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Métricas Manuais</DialogTitle>
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
                        value={leads}
                        onChange={(e) => setLeads(Number(e.target.value))}
                        className={`font-medium ${hideSpinnersClass}`}
                        required
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLeads(prev => Math.max(0, prev - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLeads(prev => prev + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Field>

                {/* Campo Vendas */}
                <Field className="flex flex-col gap-2">
                  <Label htmlFor="vendas">Vendas</Label>
                  <div className="flex items-center gap-2">
                    <Input
                        id="vendas"
                        name="vendas"
                        type="number"
                        value={vendas}
                        onChange={(e) => setVendas(Number(e.target.value))}
                        className={`font-medium ${hideSpinnersClass}`}
                        required
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setVendas(prev => Math.max(0, prev - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setVendas(prev => prev + 1)}
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
              <Button type="submit">Alimentar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}