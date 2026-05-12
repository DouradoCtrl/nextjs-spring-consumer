"use client";

import { Header } from "@/components/header";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CircleCheck, CirclePause, Search, LayoutList, CheckCircle2, PauseCircle, MousePointerClick, Eye, DollarSign, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuickFilters } from "@/components/quick-filters";
import { AdvancedFilters } from "@/components/advanced-filters";
import { InvestmentProgress } from "@/components/investment-progress";

interface Campaign {
  resourceName: string;
  id: string;
  name: string;
  status: string;
}

interface Metrics {
  clicks?: string | number;
  impressions?: string | number;
  averageCpc?: string | number;
  costMicros?: string | number;
}

interface CampaignResult {
  campaign: Campaign;
  metrics?: Metrics;
}

interface CustomerResult {
  metrics: Metrics;
}

interface GoogleAdsResponse {
  results: CampaignResult[];
  fieldMask?: string;
  queryResourceConsumption?: string;
}

interface GoogleAdsCustomerResponse {
  results: CustomerResult[];
}

const formatCurrency = (micros?: string | number) => {
  if (!micros) return "R$ 0,00";
  const val = Number(micros) / 1000000;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatNumber = (num?: string | number) => {
  if (!num) return "0";
  return new Intl.NumberFormat('pt-BR').format(Number(num));
};

const BUDGET_SETTINGS = {
  MIN: 1000,
  MAX: 1600,
  STEP: 50,
} as const;

export default function Page() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<CampaignResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalMetrics, setGeneralMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const getDefaultStartDate = () => {
    const envDate = process.env.NEXT_PUBLIC_CREATED_ACCOUNT_DATE || "2025-01-01";
    return new Date(`${envDate}T00:00:00`);
  };

  const getDefaultEndDate = () => new Date();

  const [startDate, setStartDate] = useState<Date | null>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<Date | null>(getDefaultEndDate());
  const [monthlyBudget, setMonthlyBudget] = useState([1000]);

  useEffect(() => {
    const accessToken = (session as any)?.accessToken;
    if (accessToken) {
      setLoading(true);

      let dateFilter = "";
      if (startDate && endDate) {
        const startStr = format(startDate, "yyyy-MM-dd");
        const endStr = format(endDate, "yyyy-MM-dd");
        dateFilter = ` AND segments.date BETWEEN '${startStr}' AND '${endStr}'`;
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: `SELECT campaign.id, campaign.name, campaign.status, metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros FROM campaign WHERE campaign.status != 'REMOVED'${dateFilter}`,
        }),
      })
        .then((res) => res.json())
        .then((data: GoogleAdsResponse) => {
          if (data.results) {
            setCampaigns(data.results);
          } else {
            setCampaigns([]);
          }
        })
        .catch((error) => console.error("Erro ao buscar campanhas:", error))
        .finally(() => setLoading(false));

      setLoadingMetrics(true);
      
      let customerQuery = "SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros FROM customer";
      if (dateFilter) {
          customerQuery = `SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros FROM customer WHERE segments.date BETWEEN '${format(startDate!, "yyyy-MM-dd")}' AND '${format(endDate!, "yyyy-MM-dd")}'`;
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: customerQuery,
        }),
      })
        .then((res) => res.json())
        .then((data: GoogleAdsCustomerResponse) => {
          if (data.results && data.results.length > 0) {
            console.log(data.results);
            setGeneralMetrics(data.results[0].metrics);
          } else {
            setGeneralMetrics(null);
          }
        })
        .catch((error) => console.error("Erro ao buscar métricas gerais:", error))
        .finally(() => setLoadingMetrics(false));
    } else if (session === null) {
      setLoading(false);
      setLoadingMetrics(false);
    }
  }, [session, startDate, endDate]);

  const activeCampaigns = campaigns.filter(
    (c) => c.campaign.status === "ENABLED"
  ).length;
  const pausedCampaigns = campaigns.filter(
    (c) => c.campaign.status === "PAUSED"
  ).length;

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start || getDefaultStartDate());
    setEndDate(end || getDefaultEndDate());
  };

  const handleAdvancedFilterApply = (start: Date, end: Date) => {
    setStartDate(start || getDefaultStartDate());
    setEndDate(end || getDefaultEndDate());
  };

  const diffDays = differenceInDays(endDate!, startDate!);
  const periodMonths = Math.max(1, Math.round(diffDays / 30)); // Mínimo de 1 mês garantido
  const totalBudget = monthlyBudget[0] * periodMonths;
  const currentSpend = generalMetrics?.costMicros ? Number(generalMetrics.costMicros) / 1000000 : 0;

  return (
    <div className="flex flex-1 flex-col">
      <Header>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
            <div className="ml-2 text-xs font-medium text-muted-foreground flex items-center bg-muted/50 px-3 py-1.5 rounded-md border whitespace-nowrap shrink-0">
              {startDate && endDate ? `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}` : "Todo o Período"}
            </div>
            <QuickFilters onDateChange={handleDateChange} />
              <AdvancedFilters 
                initialStartDate={startDate || undefined} 
                initialEndDate={endDate || undefined} 
                onApply={handleAdvancedFilterApply} 
              />
          </div>
      </Header>
      <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6">
        
        {/* Métricas Gerais (Conta) */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                Total de Cliques
              </CardDescription>
              <CardTitle className="text-3xl">
                {loadingMetrics ? <Skeleton className="h-8 w-24" /> : formatNumber(generalMetrics?.clicks)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                Total de Impressões
              </CardDescription>
              <CardTitle className="text-3xl">
                {loadingMetrics ? <Skeleton className="h-8 w-24" /> : formatNumber(generalMetrics?.impressions)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                CPC Médio Geral
              </CardDescription>
              <CardTitle className="text-3xl">
                {loadingMetrics ? <Skeleton className="h-8 w-24" /> : formatCurrency(generalMetrics?.averageCpc)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                Custo Total
              </CardDescription>
              <CardTitle className="text-3xl">
                {loadingMetrics ? <Skeleton className="h-8 w-24" /> : formatCurrency(generalMetrics?.costMicros)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <InvestmentProgress
          currentSpend={currentSpend}
          periodMonths={periodMonths}
          monthlyBudget={monthlyBudget}
          onMonthlyBudgetChange={setMonthlyBudget}
          totalBudget={totalBudget}
          loading={loadingMetrics}
          minBudget={BUDGET_SETTINGS.MIN}
          maxBudget={BUDGET_SETTINGS.MAX}
          step={BUDGET_SETTINGS.STEP}
        />


        <Tabs defaultValue="campaing" className="w-full">
          <TabsList>
            <TabsTrigger value="campaing">Campanhas</TabsTrigger>
            <TabsTrigger value="graphics">Gráficos</TabsTrigger>
          </TabsList>
          <TabsContent value="campaing">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 my-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <LayoutList className="h-4 w-4 text-muted-foreground" />
                    Total de Campanhas
                  </CardDescription>
                  <CardTitle className="text-3xl">{loading ? <Skeleton className="h-8 w-16" /> : campaigns.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                    Campanhas Ativas
                  </CardDescription>
                  <CardTitle className="text-3xl text-green-600 dark:text-green-500">
                    {loading ? <Skeleton className="h-8 w-16" /> : activeCampaigns}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <PauseCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    Campanhas Pausadas
                  </CardDescription>
                  <CardTitle className="text-3xl text-yellow-600 dark:text-yellow-500">
                    {loading ? <Skeleton className="h-8 w-16" /> : pausedCampaigns}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-center w-16">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">Impressões</TableHead>
                    <TableHead className="text-right">CPC Médio</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <div className="flex justify-center items-center h-full space-x-2">
                            <Skeleton className="h-8 w-full max-w-125" />
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          Nenhuma campanha encontrada.
                        </TableCell>
                      </TableRow>
                  ) : (
                      campaigns.map((result, index) => (
                          <TableRow key={result.campaign.id}>
                            <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium">{result.campaign.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {result.campaign.id}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                {result.campaign.status === "ENABLED" ? (
                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                                      <CircleCheck className="h-4 w-4" />
                                      <span className="text-xs font-medium">Ativa</span>
                                    </div>
                                ) : result.campaign.status === "PAUSED" ? (
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                                      <CirclePause className="h-4 w-4" />
                                      <span className="text-xs font-medium">Pausada</span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-medium text-muted-foreground">{result.campaign.status}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatNumber(result.metrics?.clicks)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatNumber(result.metrics?.impressions)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-muted-foreground">
                              {formatCurrency(result.metrics?.averageCpc)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-muted-foreground">
                              {formatCurrency(result.metrics?.costMicros)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <Button size="sm" variant="outline" className="h-8 gap-1.5" asChild>
                                  <Link href={`/google-ads/${result.campaign.id}`}>
                                    <Search className="h-3.5 w-3.5" />
                                    <span>Detalhes</span>
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="graphics">

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}