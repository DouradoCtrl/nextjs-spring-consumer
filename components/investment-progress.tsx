import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface InvestmentProgressProps {
  currentSpend: number;
  periodMonths: number;
  monthlyBudget: number[];
  onMonthlyBudgetChange: (value: number[]) => void;
  totalBudget: number;
  loading: boolean;
  minBudget?: number;
  maxBudget?: number;
  step?: number;
}

export function InvestmentProgress({
  currentSpend,
  periodMonths,
  monthlyBudget,
  onMonthlyBudgetChange,
  totalBudget,
  loading,
  minBudget = 1000,
  maxBudget = 1600,
  step = 50,
}: InvestmentProgressProps) {

  const rawPercentage = totalBudget > 0 ? (currentSpend / totalBudget) * 100 : 0;
  const visualPercentage = Math.min(rawPercentage, 100);

  let state: "blue" | "amber" | "red" = "blue";
  if (rawPercentage > 100) {
    state = "red";
  } else if (rawPercentage >= 80) {
    state = "amber";
  }

  const themeClasses = {
    blue: {
      text: "text-blue-600 dark:text-blue-500",
      bg: "bg-blue-100/50 dark:bg-blue-950/50",
      fill: "[&>div]:from-blue-600 [&>div]:to-blue-400 dark:[&>div]:from-blue-600 dark:[&>div]:to-blue-400",
    },
    amber: {
      text: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-100/50 dark:bg-amber-950/50",
      fill: "[&>div]:from-amber-500 [&>div]:to-amber-300 dark:[&>div]:from-amber-500 dark:[&>div]:to-amber-300",
    },
    red: {
      text: "text-red-600 dark:text-red-500",
      bg: "bg-red-100/50 dark:bg-red-950/50",
      fill: "[&>div]:from-red-600 [&>div]:to-red-400 dark:[&>div]:from-red-600 dark:[&>div]:to-red-400",
    },
  };

  return (
    <Card className="shadow-sm overflow-hidden p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <DollarSign className={`h-4 w-4 ${themeClasses[state].text}`} />
            Valor Consumido
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentSpend)}
          </div>
          <div className="text-xs font-medium text-muted-foreground/80 pt-1">
            Período de {periodMonths} {periodMonths === 1 ? 'mês selecionado' : 'meses selecionados'}
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-lg border shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Teto Mensal:
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-500 w-[60px]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(monthlyBudget[0])}
            </span>
            <Slider 
              value={monthlyBudget} 
              onValueChange={onMonthlyBudgetChange} 
              max={maxBudget} 
              min={minBudget} 
              step={step}
              className="w-24 sm:w-32"
            />
          </div>
          <div className="text-left md:text-right space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Orçamento Total</span>
            <div className="text-xl font-semibold text-muted-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget)}
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <Skeleton className="h-2 w-full rounded-full" />
      ) : (
        <div className="space-y-2">
          <Progress 
            value={visualPercentage} 
            className={`h-2 rounded-full [&>div]:bg-gradient-to-r ${themeClasses[state].bg} ${themeClasses[state].fill}`} 
          />
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground">0%</span>
            <span className={`${themeClasses[state].text} text-sm font-bold`}>
              {rawPercentage.toFixed(1)}% {rawPercentage > 100 ? "Excedido" : "Consumido"}
            </span>
            <span className="text-muted-foreground">100%</span>
          </div>
        </div>
      )}
    </Card>
  );
}