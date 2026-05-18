"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts"
import { TrendingUp, Target, DollarSign, Activity } from "lucide-react"
import { format } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { formatCurrency, formatNumber, formatPercent, formatMonthYear } from "@/lib/format-utils"

interface MonthlyData {
  month: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  leads: number;
  sales: number;
}

interface CampaignPerformanceChartsProps {
  data: MonthlyData[];
  startDate: Date | null;
  endDate: Date | null;
}

export function CampaignPerformanceCharts({
  data,
  startDate,
  endDate
}: CampaignPerformanceChartsProps) {

  // Ordena os dados cronologicamente (crescente)
  const sortedData = [...data].sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Prepara os dados adicionando métricas calculadas por mês
  const chartData = sortedData.map(item => {
    const cost = item.costMicros || 0;
    const cpc = item.clicks > 0 ? cost / item.clicks : 0;
    const cpl = item.leads > 0 ? cost / item.leads : 0;
    const ctr = item.impressions > 0 ? (item.clicks / item.impressions) : 0;

    return {
      ...item,
      formattedMonth: formatMonthYear(item.month),
      cpc,
      cpl,
      ctr,
    };
  });

  const conversionsConfig = {
    leads: { label: "Leads", color: "#10b981" },
    sales: { label: "Vendas", color: "#f59e0b" },
  }

  const efficiencyConfig = {
    cpl: { label: "CPL", color: "#ef4444" },
    cpc: { label: "CPC", color: "#3b82f6" },
  }

  const trafficConfig = {
    clicks: { label: "Cliques", color: "#3b82f6" },
    impressions: { label: "Impressões", color: "#8b5cf6" },
  }

  const dateRangeStr = startDate && endDate 
    ? `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`
    : "Todo o período";

  // Identifica tendências básicas comparando o último mês com o primeiro ou anterior
  const hasData = chartData.length > 0;
  const firstMonth = hasData ? chartData[0] : null;
  const lastMonth = hasData ? chartData[chartData.length - 1] : null;
  
  let leadsGrowthText = "";
  if (hasData && chartData.length > 1 && firstMonth && lastMonth) {
    if (lastMonth.leads > firstMonth.leads) {
      leadsGrowthText = `Crescimento de leads desde o início (${firstMonth.formattedMonth} até ${lastMonth.formattedMonth})`;
    } else if (lastMonth.leads < firstMonth.leads) {
      leadsGrowthText = `Queda de leads desde o início (${firstMonth.formattedMonth} até ${lastMonth.formattedMonth})`;
    } else {
      leadsGrowthText = `Leads estagnados ao longo do tempo`;
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {/* Gráfico 1: Evolução de Conversões (Leads e Vendas) */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Crescimento de Conversões</CardTitle>
          </div>
          <CardDescription>Evolução mensal de Leads e Vendas ({dateRangeStr})</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <ChartContainer config={conversionsConfig} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="formattedMonth" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip 
                  cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm shadow-xl min-w-40">
                          <div className="font-semibold mb-2">{label}</div>
                          <div className="grid gap-2">
                            {payload.map((entry, index) => (
                              <div key={index} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="font-bold font-mono tabular-nums">{formatNumber(entry.value as number)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ChartLegend verticalAlign="top" height={36} content={<ChartLegendContent />} />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  name="Leads"
                  stroke="var(--color-leads)" 
                  fillOpacity={1} 
                  fill="url(#fillLeads)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  name="Vendas"
                  stroke="var(--color-sales)" 
                  fillOpacity={1} 
                  fill="url(#fillSales)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        {leadsGrowthText && (
          <CardFooter className="flex-col items-start gap-2 text-sm pt-2 border-t">
            <div className="flex gap-2 font-medium leading-none items-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              {leadsGrowthText}
            </div>
            <div className="leading-none text-muted-foreground mt-1">
              Avalie como a geração de oportunidades está se comportando em volume ao longo dos meses.
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Gráfico 2: Eficiência de Custo (CPL e CPC) */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Eficiência de Custo Mensal</CardTitle>
          </div>
          <CardDescription>Oscilação do CPL e CPC ao longo do tempo ({dateRangeStr})</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <ChartContainer config={efficiencyConfig} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="formattedMonth" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                {/* Eixos Y Múltiplos porque o CPL é muito maior que o CPC normalmente */}
                <YAxis 
                  yAxisId="left" 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${val}`}
                  tick={{ fontSize: 11 }}
                  width={60}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${val}`}
                  tick={{ fontSize: 11 }}
                  width={60}
                />
                <ChartTooltip 
                  cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm shadow-xl min-w-40">
                          <div className="font-semibold mb-2">{label}</div>
                          <div className="grid gap-2">
                            {payload.map((entry, index) => (
                              <div key={index} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="font-bold font-mono tabular-nums">{formatCurrency(entry.value as number)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ChartLegend verticalAlign="top" height={36} content={<ChartLegendContent />} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="cpl" 
                  name="CPL"
                  stroke="var(--color-cpl)" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cpc" 
                  name="CPC"
                  stroke="var(--color-cpc)" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-2 border-t">
          <div className="flex gap-2 font-medium leading-none items-center">
            <DollarSign className="h-4 w-4 text-purple-500" />
            Tendência de Custos (CPL vs CPC)
          </div>
          <div className="leading-none text-muted-foreground mt-1">
            Se o CPL (eixo esquerdo) subir muito enquanto o CPC (eixo direito) cai ou se mantém, significa que a página de conversão ou os leads estão perdendo qualidade.
          </div>
        </CardFooter>
      </Card>

      {/* Gráfico 3 (Opcional): Tráfego (Impressões x Cliques) */}
      <Card className="flex flex-col md:col-span-1 lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Crescimento de Tráfego (Impressões vs Cliques)</CardTitle>
          </div>
          <CardDescription>Volume de atração de usuários ({dateRangeStr})</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <ChartContainer config={trafficConfig} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="formattedMonth" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left" 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatNumber(val)}
                  width={50}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatNumber(val)}
                  width={50}
                />
                {/* 
                  Usando Tooltip customizado aqui especificamente porque o ChartTooltipContent do Shadcn
                  não permite injetar uma linha extra formatada como porcentagem (o CTR) de forma simples 
                  quando as barras do gráfico são números absolutos.
                */}
                <ChartTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm shadow-xl min-w-40">
                          <div className="font-semibold mb-2">{label}</div>
                          <div className="grid gap-2">
                            {payload.map((entry, index) => (
                              <div key={index} className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="font-bold font-mono tabular-nums">{formatNumber(entry.value as number)}</span>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-1 flex justify-between items-center gap-4">
                                <span className="text-muted-foreground font-medium">CTR</span>
                                <span className="font-bold font-mono text-emerald-600 tabular-nums">
                                  {formatPercent(payload[0].payload.ctr)}
                                </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ChartLegend verticalAlign="top" height={36} content={<ChartLegendContent />} />
                <Bar yAxisId="left" dataKey="clicks" name="Cliques" fill="var(--color-clicks)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="right" dataKey="impressions" name="Impressões" fill="var(--color-impressions)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
