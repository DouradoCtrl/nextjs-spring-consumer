"use client";

import { Header } from "@/components/header";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MousePointerClick, Target, DollarSign, Eye, Percent, Activity, TrendingUp, MoreVertical, SquarePen } from "lucide-react";
import { MetricsDetailsModal } from "@/components/metrics-details-modal";
import { CampaignPerformanceCharts } from "@/components/campaign-performance-charts";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { QuickFilters } from "@/components/quick-filters";
import { AdvancedFilters } from "@/components/advanced-filters";
import { ManualMetricsModal } from "@/components/manual-metrics-modal";
import { fetchCampaignInfo, fetchCombinedMetrics, upsertCampaignMetrics } from "@/services/campaign-service";
import { formatCurrency, formatNumber, formatPercent, getStatusText, getStatusColor, formatMonthYear } from "@/lib/format-utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Campaign {
  status: string;
  name: string;
}

interface CombinedMetricsResult {
  month: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  leads: number;
  sales: number;
  hasInternalData: boolean;
}

export default function CampaignDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();

  // Estados dos filtros principais - null indica todo o perodo por padro
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estados de dados
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [results, setResults] = useState<CombinedMetricsResult[]>([]);
  const [campaignInfo, setCampaignInfo] = useState<Campaign | null>(null);
  const [selectedRowMetrics, setSelectedRowMetrics] = useState<{
    month: string;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    sales: number;
    costPerConversion?: number;
    costPerConversionValid: boolean;
    averageCpc?: number;
    cpm: number;
    costMicros: number;
  } | null>(null);
  const [selectedManualMetricsRow, setSelectedManualMetricsRow] = useState<{
    month: string;
    initialLeads: number;
    initialSales: number;
    isUpdate: boolean;
  } | null>(null);

  const loadCampaignInfo = async () => {
    const accessToken = (session as { accessToken?: string })?.accessToken;
    if (!accessToken || !id) return;

    setLoadingInfo(true);
    try {
      const info = await fetchCampaignInfo(id, accessToken);
      setCampaignInfo(info);
    } catch (error) {
      console.error("Erro ao buscar info da campanha:", error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const loadCampaignMetrics = async () => {
    const accessToken = (session as { accessToken?: string })?.accessToken;
    if (!accessToken || !id) return;

    setLoadingMetrics(true);
    try {
      const combinedMetrics = await fetchCombinedMetrics(id, startDate, endDate, accessToken);
      setResults(combinedMetrics || []);
    } catch (error) {
      console.error("Erro ao buscar mtricas da campanha:", error);
      setResults([]);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if ((session as any)?.accessToken) {
      void loadCampaignInfo();
    } else if (session === null) {
      setLoadingInfo(false);
    }
  }, [id, session]);

  useEffect(() => {
    if ((session as any)?.accessToken) {
      void loadCampaignMetrics();
    } else if (session === null) {
      setLoadingMetrics(false);
    }
  }, [id, session, startDate, endDate]);

  // ADICIONADO: Função para lidar com a submissão das métricas manuais e recarregar a tabela
  const handleManualMetricsSubmit = async (formData: { id: string; leads: number; sales: number }) => {
    const accessToken = (session as { accessToken?: string })?.accessToken;
    if (!accessToken || !selectedManualMetricsRow) return;

    try {
      await upsertCampaignMetrics({
        campaignId: formData.id,
        month: selectedManualMetricsRow.month,
        leads: formData.leads,
        sales: formData.sales,
        isUpdate: selectedManualMetricsRow.isUpdate,
        accessToken,
      });

      void loadCampaignMetrics();
    } catch (error) {
      console.error("Erro ao salvar mtricas manuais:", error);
    }
  };

  // Totais agregados (Single Pass)
  let totalClicks = 0;
  let totalLeads = 0;
  let totalSales = 0;
  let totalCostMicros = 0;
  let totalImpressions = 0;

  for (const result of results) {
    totalClicks += result.clicks || 0;
    totalLeads += result.leads || 0;
    totalSales += result.sales || 0;
    totalCostMicros += result.costMicros || 0;
    totalImpressions += result.impressions || 0;
  }

  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgCpm = totalImpressions > 0 ? (totalCostMicros / totalImpressions) * 1000 : 0;
  const avgCpc = totalClicks > 0 ? totalCostMicros / totalClicks : 0;

  // Usar leads para o CPL, ou sales se quiser CPA de vendas. Assumindo leads como primrio.
  const cplGeral = totalLeads > 0 ? totalCostMicros / totalLeads : 0;

  // Componentes de Cards extraídos para reutilização nas Tabs
  const CardImpressions = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <Eye className="h-4 w-4 text-orange-500" />
          Total de Impressões
        </CardDescription>
        <CardTitle className="text-4xl text-orange-600 dark:text-orange-500">
          {loadingMetrics ? <Skeleton className="h-10 w-24" /> : formatNumber(totalImpressions)}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardClicks = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          Total de Cliques
        </CardDescription>
        <CardTitle className="text-4xl text-blue-600 dark:text-blue-500">
          {loadingMetrics ? <Skeleton className="h-10 w-16" /> : formatNumber(totalClicks)}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardCtr = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <Percent className="h-4 w-4 text-cyan-500" />
          CTR Médio
        </CardDescription>
        <CardTitle className="text-4xl text-cyan-600 dark:text-cyan-500">
          {loadingMetrics ? <Skeleton className="h-10 w-24" /> : formatPercent(avgCtr)}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardCpm = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <Activity className="h-4 w-4 text-indigo-500" />
          CPM Médio
        </CardDescription>
        <CardTitle className="text-4xl text-indigo-600 dark:text-indigo-500">
          {loadingMetrics ? <Skeleton className="h-10 w-24" /> : formatCurrency(avgCpm)}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardCpc = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <DollarSign className="h-4 w-4 text-amber-500" />
          CPC Médio Geral
        </CardDescription>
        <CardTitle className="text-4xl text-amber-600 dark:text-amber-500">
          {loadingMetrics ? <Skeleton className="h-10 w-24" /> : formatCurrency(avgCpc)}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardLeads = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
          Total de Leads
        </CardDescription>
        <CardTitle className="text-4xl text-emerald-600 dark:text-emerald-500">
          {loadingMetrics ? <Skeleton className="h-10 w-24" /> : formatNumber(Number(totalLeads.toFixed(2)))}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardSales = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
          Total de Vendas
        </CardDescription>
        <CardTitle className="text-4xl text-emerald-600 dark:text-emerald-500">
          {loadingMetrics ? <Skeleton className="h-10 w-24" /> : formatNumber(Number(totalSales.toFixed(2)))}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardCpl = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <TrendingUp className="h-4 w-4 text-rose-500" />
          CPL Médio
        </CardDescription>
        <CardTitle className="text-4xl text-rose-600 dark:text-rose-500">
          {loadingMetrics ? <Skeleton className="h-10 w-24" /> : formatCurrency(cplGeral)}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const CardTotalCost = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 font-medium">
          <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-500" />
          Custo Total
        </CardDescription>
        <CardTitle className="text-4xl text-purple-600 dark:text-purple-500">
          {loadingMetrics ? <Skeleton className="h-10 w-32" /> : formatCurrency(totalCostMicros)}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  const MetricsTable = () => (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-2">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/50">
            <TableHead>Mês</TableHead>
            <TableHead className="text-right font-bold">Impressões</TableHead>
            <TableHead className="text-right font-bold">Cliques</TableHead>
            <TableHead className="text-right font-bold">Leads</TableHead>
            <TableHead className="text-right font-bold">Vendas</TableHead>
            <TableHead className="text-right font-bold">Custo</TableHead>
            <TableHead className="text-center w-25 font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingMetrics ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex justify-center items-center h-full">
                    <span className="text-muted-foreground animate-pulse">Carregando métricas...</span>
                  </div>
                </TableCell>
              </TableRow>
          ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Nenhum dado de métrica encontrado para este período.
                </TableCell>
              </TableRow>
          ) : (
              results.map((result, index) => {
                const leads = result.leads || 0;
                const sales = result.sales || 0;
                const hasInternalData = result.hasInternalData;
                const costPerConversionValid = leads > 0;

                const rowClicks = result.clicks || 0;
                const rowImpressions = result.impressions || 0;
                const rowCostMicros = result.costMicros || 0;

                const rowCtr = rowImpressions > 0 ? rowClicks / rowImpressions : 0;
                const rowCpm = rowImpressions > 0 ? (rowCostMicros / rowImpressions) * 1000 : 0;
                const rowCpl = leads > 0 ? rowCostMicros / leads : 0;
                const rowCpc = rowClicks > 0 ? rowCostMicros / rowClicks : 0;

                return (
                    <TableRow key={index}>
                      <TableCell className="font-medium capitalize">
                        {formatMonthYear(result.month)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatNumber(rowImpressions)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatNumber(rowClicks)}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">
                        {leads > 0 ? leads.toFixed(0) : "0"}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">
                        {sales > 0 ? sales.toFixed(0) : "0"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-purple-600">
                        {formatCurrency(rowCostMicros)}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={() =>
                                    setSelectedRowMetrics({
                                      month: result.month,
                                      impressions: rowImpressions,
                                      clicks: rowClicks,
                                      ctr: rowCtr,
                                      conversions: leads,
                                      sales: sales,
                                      costPerConversion: rowCpl,
                                      costPerConversionValid,
                                      averageCpc: rowCpc,
                                      cpm: rowCpm,
                                      costMicros: rowCostMicros,
                                    })
                                }
                            >
                              <Eye/>
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    setSelectedManualMetricsRow({
                                      month: result.month,
                                      initialLeads: leads,
                                      initialSales: sales,
                                      isUpdate: hasInternalData,
                                    })
                                }
                            >
                              <SquarePen />
                              Métricas
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                );
              })
          )}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold">
              {formatNumber(totalImpressions)}
            </TableCell>
            <TableCell className="text-right font-bold">
              {formatNumber(totalClicks)}
            </TableCell>
            <TableCell className="text-right font-bold">
              {totalLeads > 0 ? totalLeads.toFixed(0) : "0"}
            </TableCell>
            <TableCell className="text-right font-bold">
              {totalSales > 0 ? totalSales.toFixed(0) : "0"}
            </TableCell>
            <TableCell colSpan={2}  className="text-center font-bold">
              <div className="ml-4">
                {formatCurrency(totalCostMicros)}
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );

  return (
      <div className="flex flex-1 flex-col h-full bg-muted/20">
        <Header>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
            <div className="ml-2 text-xs font-medium text-muted-foreground flex items-center bg-muted/50 px-3 py-1.5 rounded-md border whitespace-nowrap shrink-0">
              {startDate && endDate ? `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}` : "Todo o Perodo"}
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

          {/* Cabealho da pgina (Ttulo) */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {loadingInfo && !campaignInfo ? (
                    <Skeleton className="h-9 w-64" />
                ) : (
                    campaignInfo?.name || "Campanha no encontrada"
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

          {/* KPIs Tabs */}
          <Tabs defaultValue="relevantes" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="relevantes">Relevantes</TabsTrigger>
              <TabsTrigger value="trafego">Tráfego</TabsTrigger>
              <TabsTrigger value="custos">Custos</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="relevantes" className="mt-0">
              <div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <CardLeads />
                <CardSales />
                <CardCpl />
                <CardTotalCost />
              </div>
            </TabsContent>
            
            <TabsContent value="trafego" className="mt-0">
              <div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <CardImpressions />
                <CardClicks />
                <CardCtr />
                <CardCpc />
              </div>
            </TabsContent>
            
            <TabsContent value="custos" className="mt-0">
              <div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <CardCpl />
                <CardCpm />
                <CardCpc />
                <CardTotalCost />
              </div>
            </TabsContent>
            
            <TabsContent value="todos" className="mt-0">
              <div className="flex flex-col gap-4">
                <div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
                  <CardTotalCost />
                  <CardImpressions />
                  <CardClicks />

                </div>
                <div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
                  <CardCtr />
                  <CardCpm />
                  <CardCpc />
                </div>
                <div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
                  <CardLeads />
                  <CardSales />
                  <CardCpl />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Dados Detalhados Tabs (Tabela vs Gráficos) */}
          <Tabs defaultValue="tabela" className="w-full mt-2">
            <TabsList className="mb-4">
              <TabsTrigger value="tabela">Tabela de Desempenho</TabsTrigger>
              <TabsTrigger value="graficos">Gráfico de Desempenho</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tabela" className="mt-0">
              <MetricsTable />
            </TabsContent>
            
            <TabsContent value="graficos" className="mt-0">
              {loadingMetrics ? (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-2 p-8 flex justify-center items-center h-64">
                  <span className="text-muted-foreground animate-pulse">Carregando gráficos...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="mt-2">
                  <CampaignPerformanceCharts
                    data={results}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              ) : (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-2 p-8 flex justify-center items-center h-64">
                  <span className="text-muted-foreground">Nenhum dado encontrado para gerar gráficos.</span>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Modal de Detalhes */}
          {selectedRowMetrics && (
              <MetricsDetailsModal
                  month={selectedRowMetrics.month}
                  impressions={selectedRowMetrics.impressions}
                  clicks={selectedRowMetrics.clicks}
                  ctr={selectedRowMetrics.ctr}
                  conversions={selectedRowMetrics.conversions}
                  sales={selectedRowMetrics.sales}
                  costPerConversion={selectedRowMetrics.costPerConversion}
                  costPerConversionValid={selectedRowMetrics.costPerConversionValid}
                  averageCpc={selectedRowMetrics.averageCpc}
                  cpm={selectedRowMetrics.cpm}
                  costMicros={selectedRowMetrics.costMicros}
                  formatCurrency={formatCurrency}
                  formatNumber={formatNumber}
                  formatPercent={formatPercent}
                  open={!!selectedRowMetrics}
                  onOpenChange={(open: boolean) => !open && setSelectedRowMetrics(null)}
              />
          )}

          {/* Modal de Métricas Manuais */}
          {selectedManualMetricsRow && campaignInfo && (
              <ManualMetricsModal
                  id={id}
                  month={selectedManualMetricsRow.month}
                  campaignName={campaignInfo.name}
                  initialLeads={selectedManualMetricsRow.initialLeads}
                  initialSales={selectedManualMetricsRow.initialSales}
                  isUpdate={selectedManualMetricsRow.isUpdate}
                  open={!!selectedManualMetricsRow}
                  onOpenChange={(open: boolean) => !open && setSelectedManualMetricsRow(null)}
                  onSubmit={handleManualMetricsSubmit} // ADICIONADO: Prop onSubmit conectada à service dinâmica
              />
          )}
        </div>
      </div>
  );
}