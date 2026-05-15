"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface MetricsDetailsModalProps {
  month: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number; // Agora representando Leads
  sales: number;
  costPerConversion?: number;
  costPerConversionValid: boolean;
  averageCpc?: number;
  cpm: number;
  costMicros: number;
  formatCurrency: (micros?: number | string) => string;
  formatNumber: (num?: number | string) => string;
  formatPercent: (val?: number | string) => string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MetricsDetailsModal({
  month,
  impressions,
  clicks,
  ctr,
  conversions, // Leads
  sales,
  costPerConversion,
  costPerConversionValid,
  averageCpc,
  cpm,
  costMicros,
  formatCurrency,
  formatNumber,
  formatPercent,
  open,
  onOpenChange,
}: MetricsDetailsModalProps) {
  const metrics = [
    { label: "Impressões", value: formatNumber(impressions) },
    { label: "Cliques", value: formatNumber(clicks) },
    { label: "CTR", value: formatPercent(ctr) },
    { label: "Leads", value: conversions > 0 ? conversions.toFixed(2) : "0", color: "text-emerald-600" },
    { label: "Vendas", value: sales > 0 ? sales.toFixed(2) : "0", color: "text-emerald-600" },
    { label: "CPL (Custo/Lead)", value: costPerConversionValid ? formatCurrency(costPerConversion) : "-" },
    { label: "CPC Médio", value: averageCpc ? formatCurrency(averageCpc) : "-" },
    { label: "CPM Médio", value: cpm ? formatCurrency(cpm) : "-" },
    { label: "Custo Total", value: formatCurrency(costMicros), color: "text-purple-600", separator: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Métricas Detalhadas</DialogTitle>
          <DialogDescription>Desempenho da campanha em {month}</DialogDescription>
        </DialogHeader>
        <Table>
          <TableBody>
            {metrics.map((metric, idx) => (
              <TableRow key={idx} className={metric.separator ? "border-t-2" : ""}>
                <TableCell className="text-muted-foreground text-sm">{metric.label}</TableCell>
                <TableCell className={`text-right text-sm font-medium ${metric.color || ""}`}>
                  {metric.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
