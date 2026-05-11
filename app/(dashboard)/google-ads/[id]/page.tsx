"use client";

import { Header } from "@/components/header";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MousePointerClick, Target, DollarSign } from "lucide-react";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { QuickFilters } from "@/components/quick-filters";
import { AdvancedFilters } from "@/components/advanced-filters";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Campaign {
  status: string;
  name: string;
}

interface Metrics {
  clicks?: string;
  conversions?: number;
  costMicros?: string;
  costPerConversion?: number;
  averageCpc?: number;
}

interface Segments {
  month?: string;
}

interface CampaignResult {
  campaign: Campaign;
  metrics?: Metrics;
  segments?: Segments;
}

interface GoogleAdsResponse {
  results?: CampaignResult[];
}

export default function CampaignDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();

  // Estados dos filtros principais - null indica todo o período por padrão
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estados de dados
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<CampaignResult[]>([]);
  const [campaignInfo, setCampaignInfo] = useState<Campaign | null>(null);

  const fetchCampaignDetails = async () => {
    const accessToken = (session as { accessToken?: string })?.accessToken;

    if (!accessToken || !id) return;

    setLoading(true);

    try {
      // 1. Busca primeiro as informações básicas da campanha sem segmentos 
      // Isso garante que o nome e status sempre vão aparecer, mesmo que não haja métricas no período
      const infoQuery = `SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.id = ${id}`;
      const infoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query: infoQuery }),
      });
      const infoData = await infoResponse.json();
      if (infoData.results && infoData.results.length > 0) {
        setCampaignInfo(infoData.results[0].campaign);
      }

      // 2. Configura a query de métricas segmentada por mês
      let dateFilter: string;
      if (startDate && endDate) {
        const startStr = format(startDate, "yyyy-MM-dd");
        const endStr = format(endDate, "yyyy-MM-dd");
        dateFilter = ` AND segments.date BETWEEN '${startStr}' AND '${endStr}'`;
      } else {
        // A API do Google Ads OBRIGA a ter um filtro de data no WHERE quando estamos 
        // usando a coluna segments.month. Para "Todo o período", colocamos um intervalo abrangente.
        const todayStr = format(new Date(), "yyyy-MM-dd");
        dateFilter = ` AND segments.date BETWEEN '2010-01-01' AND '${todayStr}'`;
      }

      const metricsQuery = `SELECT campaign.id, segments.month, metrics.clicks, metrics.average_cpc, metrics.cost_per_conversion, metrics.conversions, metrics.cost_micros FROM campaign WHERE campaign.id = ${id}${dateFilter} ORDER BY segments.month DESC`;

      const metricsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query: metricsQuery }),
      });

      if (!metricsResponse.ok) {
        throw new Error(`Erro na API: ${metricsResponse.status}`);
      }

      const metricsData: GoogleAdsResponse = await metricsResponse.json();

      if (metricsData.results && metricsData.results.length > 0) {
        setResults(metricsData.results);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da campanha:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((session as any)?.accessToken) {
      // Ignorando intencionalmente a promise retornada
      void fetchCampaignDetails();
    } else if (session === null) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session, startDate, endDate]);

  // Totais agregados
  const totalClicks = results.reduce((acc, curr) => acc + Number(curr.metrics?.clicks || 0), 0);
  const totalConversions = results.reduce((acc, curr) => acc + (curr.metrics?.conversions || 0), 0);
  const totalCostMicros = results.reduce((acc, curr) => acc + Number(curr.metrics?.costMicros || 0), 0);

  const formatCurrency = (micros?: number | string) => {
    if (!micros) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(micros) / 1000000);
  };

  const formatNumber = (num?: number | string) => {
    if (!num) return "0";
    return new Intl.NumberFormat('pt-BR').format(Number(num));
  };

  // Auxiliares para Status
  const getStatusText = (status: string) => {
    switch (status) {
      case "ENABLED": return "Ativa";
      case "PAUSED": return "Pausada";
      case "REMOVED": return "Removida";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENABLED": return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "PAUSED": return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "REMOVED": return "bg-red-50 text-red-700 ring-red-600/20";
      default: return "bg-slate-50 text-slate-700 ring-slate-600/20";
    }
  };

  return (
      <div className="flex flex-1 flex-col h-full bg-muted/20">
        <Header>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
            <div className="ml-2 text-xs font-medium text-muted-foreground flex items-center bg-muted/50 px-3 py-1.5 rounded-md border whitespace-nowrap shrink-0">
              {startDate && endDate ? `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}` : "Todo o Período"}
            </div>

            <QuickFilters
                onDateChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
            />

            <AdvancedFilters
                initialStartDate={startDate || undefined}
                initialEndDate={endDate || undefined}
                onApply={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
            />

          </div>
        </Header>

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6">

          {/* Cabeçalho da página (Título) */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {loading && !campaignInfo ? (
                    <Skeleton className="h-9 w-64" />
                ) : (
                    campaignInfo?.name || "Campanha não encontrada"
                )}
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                ID: {id}
                {campaignInfo?.status && (
                    <span className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        getStatusColor(campaignInfo.status)
                    )}>
                  {getStatusText(campaignInfo.status)}
                </span>
                )}
              </p>
            </div>
          </div>

          {/* Cards de Resumo (Totais) */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3 mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 font-medium">
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                  Total de Cliques
                </CardDescription>
                <CardTitle className="text-4xl text-blue-600 dark:text-blue-500">
                  {loading ? <Skeleton className="h-10 w-16" /> : formatNumber(totalClicks)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 font-medium">
                  <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                  Total de Conversões
                </CardDescription>
                <CardTitle className="text-4xl text-emerald-600 dark:text-emerald-500">
                  {loading ? <Skeleton className="h-10 w-24" /> : formatNumber(Number(totalConversions.toFixed(2)))}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 font-medium">
                  <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                  Custo Total
                </CardDescription>
                <CardTitle className="text-4xl text-purple-600 dark:text-purple-500">
                  {loading ? <Skeleton className="h-10 w-32" /> : formatCurrency(totalCostMicros)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabela de Desempenho por Mês */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/50">
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">Conversões</TableHead>
                  <TableHead className="text-right">Custo / Conversão</TableHead>
                  <TableHead className="text-right">CPC Médio</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex justify-center items-center h-full">
                          <span className="text-muted-foreground animate-pulse">Carregando métricas...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                ) : results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        Nenhum dado de métrica encontrado para este período.
                      </TableCell>
                    </TableRow>
                ) : (
                    results.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {result.segments?.month}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatNumber(Number(result.metrics?.clicks || 0))}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            {result.metrics?.conversions ? result.metrics.conversions.toFixed(2) : "0"}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {result.metrics?.costPerConversion ? formatCurrency(result.metrics.costPerConversion) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {result.metrics?.averageCpc ? formatCurrency(result.metrics.averageCpc) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-purple-600">
                            {formatCurrency(Number(result.metrics?.costMicros || 0))}
                          </TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
  );
}