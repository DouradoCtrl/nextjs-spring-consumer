"use client"

import { useEffect, useState } from "react"
import { TrendingUp, MousePointerClick, Eye, DollarSign, Activity } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

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
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// 1. Cores Hexadecimais diretas aplicadas (Resolve os pontos pretos e linhas invisíveis)
const chartConfig = {
    clicks: { label: "Cliques", color: "#3b82f6", icon: MousePointerClick }, // Azul
    impressions: { label: "Impressões", color: "#8b5cf6", icon: Eye },       // Roxo
    cost: { label: "Custo (R$)", color: "#10b981", icon: DollarSign },       // Verde
    cpc: { label: "CPC Médio", color: "#f59e0b", icon: Activity },           // Laranja
} satisfies ChartConfig

interface ChartDataPoint {
    month: string;
    clicks: number;
    impressions: number;
    cost: number;
    cpc: number;
    fullDate: string;
}

interface CampaignMonthlyChartProps {
    accessToken: string;
    startDate: Date | null;
    endDate: Date | null;
    className: string | undefined;
}

export function CampaignMonthlyChart({ accessToken, startDate, endDate, className }: CampaignMonthlyChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)

    // Estado para controlar a visibilidade de cada linha
    const [activeLines, setActiveLines] = useState({
        clicks: true,
        impressions: true,
        cost: true,
        cpc: true,
    })

    // Função para ligar/desligar a linha
    const toggleLine = (key: keyof typeof activeLines) => {
        setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    useEffect(() => {
        const fetchMonthlyMetrics = async () => {
            if (!accessToken || !startDate || !endDate) return

            setLoading(true)
            const startStr = format(startDate, "yyyy-MM-dd")
            const endStr = format(endDate, "yyyy-MM-dd")

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        query: `SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros, segments.month FROM customer WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`
                    }),
                })

                const json = await response.json()

                if (json.results) {
                    const formattedData = json.results.map((item: any) => {
                        const date = parseISO(item.segments.month)
                        return {
                            month: format(date, "MMM/yy", { locale: ptBR }),
                            // Adicionado "|| 0" para garantir que valores nulos sejam numéricos
                            clicks: Number(item.metrics.clicks || 0),
                            impressions: Number(item.metrics.impressions || 0),
                            cost: Number((Number(item.metrics.costMicros || 0) / 1000000).toFixed(2)),
                            cpc: Number((Number(item.metrics.averageCpc || 0) / 1000000).toFixed(2)),
                            fullDate: item.segments.month
                        }
                    })

                    formattedData.sort((a: any, b: any) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
                    setData(formattedData)
                } else {
                    setData([])
                }
            } catch (error) {
                console.error("Erro ao carregar gráfico:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMonthlyMetrics()
    }, [accessToken, startDate, endDate])

    if (loading) {
        return (
            <Card className={cn("w-full", className)}>
                <CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/3" /></CardHeader>
                <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle>Desempenho Geral - Gráfico de Linhas</CardTitle>
                <CardDescription>
                    {startDate ? format(startDate, "dd/MM/yyyy") : "..."} a {endDate ? format(endDate, "dd/MM/yyyy") : "..."}
                </CardDescription>

                {/* 2. Botões Nativos Estilizados (Garante que os botões vão aparecer) */}
                <div className="flex flex-wrap gap-2 pt-4">
                    {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((key) => {
                        const config = chartConfig[key]
                        const Icon = config.icon
                        const isActive = activeLines[key]

                        return (
                            <button
                                key={key}
                                onClick={() => toggleLine(key)}
                                className={`flex items-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors border ${
                                    isActive
                                        ? "text-white"
                                        : "bg-transparent text-foreground opacity-50 hover:opacity-100"
                                }`}
                                style={
                                    isActive
                                        ? { backgroundColor: config.color, borderColor: config.color }
                                        : { borderColor: config.color }
                                }
                            >
                                <Icon className="mr-1.5 h-3.5 w-3.5" />
                                {config.label}
                            </button>
                        )
                    })}
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-[2/1] md:aspect-auto md:h-[350px]">
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{ left: 12, right: 12, top: 20 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />

                        {/* Eixos Y Ocultos para separar volumes altos (Impressões) de valores baixos (CPC) */}
                        <YAxis yAxisId="left" orientation="left" hide />
                        <YAxis yAxisId="right" orientation="right" hide />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel className="w-[180px]" />}
                        />

                        {/* 3. connectNulls garante que a linha não quebre e type="monotone" ajuda no desenho contínuo */}
                        <Line
                            yAxisId="left"
                            hide={!activeLines.clicks}
                            dataKey="clicks"
                            type="monotone"
                            stroke="var(--color-clicks)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-clicks)" }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                        <Line
                            yAxisId="left"
                            hide={!activeLines.impressions}
                            dataKey="impressions"
                            type="monotone"
                            stroke="var(--color-impressions)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-impressions)" }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                        <Line
                            yAxisId="right"
                            hide={!activeLines.cost}
                            dataKey="cost"
                            type="monotone"
                            stroke="var(--color-cost)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-cost)" }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                        <Line
                            yAxisId="right"
                            hide={!activeLines.cpc}
                            dataKey="cpc"
                            type="monotone"
                            stroke="var(--color-cpc)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-cpc)" }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    {data.length > 0 ? (
                        <>Análise interativa baseada em {data.length} meses <TrendingUp className="h-4 w-4" /></>
                    ) : (
                        "Nenhum dado encontrado para este período"
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Clique nos botões acima para isolar ou combinar métricas.
                </div>
            </CardFooter>
        </Card>
    )
}