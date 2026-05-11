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
import { Button } from "@/components/ui/button";

import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { 
  format, 
  getWeek, 
  setWeek, 
  startOfWeek, 
  endOfWeek,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// --- Tipagens (Interfaces) ---

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Campaign {
  resourceName: string;
  status: string;
  name: string;
  id: string;
}

interface Metrics {
  clicks?: string;
  conversions?: number;
  costMicros?: string;
  costPerConversion?: number;
  averageCpc?: number;
}

interface Segments {
  month: string;
}

interface CampaignResult {
  campaign: Campaign;
  metrics: Metrics;
  segments: Segments;
}

interface GoogleAdsResponse {
  results?: CampaignResult[];
  fieldMask?: string;
  queryResourceConsumption?: string;
}

export default function CampaignDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  
  // Formatando data atual e primeiro dia do mês para valores padrão
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  // Estados dos filtros principais
  const [startDate, setStartDate] = useState<Date | undefined>(firstDay);
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  
  // Estados do Modal de Filtro
  const currentYear = today.getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("month");
  const [tempYear, setTempYear] = useState<string>(currentYear.toString());
  const [tempMonth, setTempMonth] = useState<string>(today.getMonth().toString());
  const [tempWeek, setTempWeek] = useState<string>(getWeek(today, { weekStartsOn: 1 }).toString());
  const [tempQuarter, setTempQuarter] = useState<string>(Math.floor(today.getMonth() / 3).toString());
  const [tempSemester, setTempSemester] = useState<string>(Math.floor(today.getMonth() / 6).toString());
  
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(firstDay);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(today);

  // Estados de dados
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<CampaignResult[]>([]);
  const [campaignInfo, setCampaignInfo] = useState<Campaign | null>(null);

  // Sincronizar modal com estado principal ao abrir
  useEffect(() => {
    if (isModalOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [isModalOpen, startDate, endDate]);

  const handlePresetChange = (preset: string) => {
    const todayDate = new Date();
    
    switch (preset) {
      case "today":
        setStartDate(todayDate);
        setEndDate(todayDate);
        break;
      case "yesterday":
        const yesterday = subDays(todayDate, 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case "thisWeek":
        setStartDate(startOfWeek(todayDate, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(todayDate, { weekStartsOn: 1 }));
        break;
      case "lastWeek":
        const lastWeek = subWeeks(todayDate, 1);
        setStartDate(startOfWeek(lastWeek, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(lastWeek, { weekStartsOn: 1 }));
        break;
      case "thisMonth":
        setStartDate(startOfMonth(todayDate));
        setEndDate(endOfMonth(todayDate));
        break;
      case "lastMonth":
        const lastMonth = subMonths(todayDate, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case "thisSemester":
        const currentMonth = todayDate.getMonth();
        if (currentMonth < 6) {
          setStartDate(new Date(todayDate.getFullYear(), 0, 1));
          setEndDate(new Date(todayDate.getFullYear(), 5, 30));
        } else {
          setStartDate(new Date(todayDate.getFullYear(), 6, 1));
          setEndDate(new Date(todayDate.getFullYear(), 11, 31));
        }
        break;
      case "lastSemester":
        const month = todayDate.getMonth();
        if (month < 6) {
          setStartDate(new Date(todayDate.getFullYear() - 1, 6, 1));
          setEndDate(new Date(todayDate.getFullYear() - 1, 11, 31));
        } else {
          setStartDate(new Date(todayDate.getFullYear(), 0, 1));
          setEndDate(new Date(todayDate.getFullYear(), 5, 30));
        }
        break;
      case "thisYear":
        setStartDate(startOfYear(todayDate));
        setEndDate(endOfYear(todayDate));
        break;
      case "lastYear":
        const lastYear = subYears(todayDate, 1);
        setStartDate(startOfYear(lastYear));
        setEndDate(endOfYear(lastYear));
        break;
    }
  };

  const handleApplyFilter = () => {
    let newStart = tempStartDate;
    let newEnd = tempEndDate;

    const year = parseInt(tempYear);
    
    if (filterType === "year") {
      newStart = new Date(year, 0, 1);
      newEnd = new Date(year, 11, 31);
    } else if (filterType === "month") {
      const month = parseInt(tempMonth);
      newStart = new Date(year, month, 1);
      newEnd = new Date(year, month + 1, 0); // último dia do mês
    } else if (filterType === "week") {
      const week = parseInt(tempWeek);
      const dateInYear = new Date(year, 0, 1);
      const dateInWeek = setWeek(dateInYear, week, { weekStartsOn: 1 });
      newStart = startOfWeek(dateInWeek, { weekStartsOn: 1 });
      newEnd = endOfWeek(dateInWeek, { weekStartsOn: 1 });
    } else if (filterType === "quarter") {
      const quarter = parseInt(tempQuarter);
      const startMonth = quarter * 3;
      newStart = new Date(year, startMonth, 1);
      newEnd = new Date(year, startMonth + 3, 0);
    } else if (filterType === "semester") {
      const semester = parseInt(tempSemester);
      const startMonth = semester * 6;
      newStart = new Date(year, startMonth, 1);
      newEnd = new Date(year, startMonth + 6, 0);
    }

    setStartDate(newStart);
    setEndDate(newEnd);
    setIsModalOpen(false);
  };

  const fetchCampaignDetails = async () => {
    const accessToken = (session as { accessToken?: string })?.accessToken;
    
    if (!accessToken || !id) return;
    
    setLoading(true);
    
    try {
      const queryStartDate = startDate ? format(startDate, "yyyy-MM-dd") : format(firstDay, "yyyy-MM-dd");
      const queryEndDate = endDate ? format(endDate, "yyyy-MM-dd") : format(today, "yyyy-MM-dd");

      const query = `SELECT campaign.id, campaign.name, campaign.status, segments.month, metrics.clicks, metrics.average_cpc, metrics.cost_per_conversion, metrics.conversions, metrics.cost_micros FROM campaign WHERE campaign.id = ${id} AND segments.date >= '${queryStartDate}' AND segments.date <= '${queryEndDate}' ORDER BY segments.month DESC`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: GoogleAdsResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        // O nome da campanha é igual em todos os meses
        setCampaignInfo(data.results[0].campaign);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da campanha:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carrega a primeira vez quando a sessão estiver disponível, e sempre que as datas mudarem
    if ((session as any)?.accessToken) {
      fetchCampaignDetails();
    } else if (session === null) {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session, startDate, endDate]);

  // Totais agregados
  const totalClicks = results.reduce((acc, curr) => acc + Number(curr.metrics.clicks || 0), 0);
  const totalConversions = results.reduce((acc, curr) => acc + (curr.metrics.conversions || 0), 0);
  const totalCostMicros = results.reduce((acc, curr) => acc + Number(curr.metrics.costMicros || 0), 0);
  
  const formatCurrency = (micros: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(micros / 1000000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
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

  const generateWeeksForMonth = (yearStr: string, monthStr: string) => {
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    
    const weeks = [];
    
    // Começa no início da semana que contém o primeiro dia do mês
    let currentDate = startOfWeek(new Date(year, month, 1), { weekStartsOn: 1 });
    const endDate = new Date(year, month + 1, 0); // Último dia do mês
    
    let index = 1;
    while (currentDate <= endDate) {
      const wStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const wEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      const weekNumber = getWeek(currentDate, { weekStartsOn: 1 });
      
      weeks.push({
        value: weekNumber.toString(),
        label: `Semana ${index} (${format(wStart, "dd/MM")} - ${format(wEnd, "dd/MM")})`
      });
      
      currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      index++;
    }
    
    return weeks;
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-muted/20">
      <Header>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 shadow-none">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline-block text-xs">Períodos Rápidos</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Dias</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePresetChange("today")}>Hoje</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePresetChange("yesterday")}>Ontem</DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Semanas</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePresetChange("thisWeek")}>Esta Semana</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePresetChange("lastWeek")}>Semana Passada</DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Meses</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePresetChange("thisMonth")}>Este Mês</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePresetChange("lastMonth")}>Mês Passado</DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Semestres</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePresetChange("thisSemester")}>Este Semestre</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePresetChange("lastSemester")}>Semestre Passado</DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Anos</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePresetChange("thisYear")}>Este Ano</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePresetChange("lastYear")}>Ano Passado</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 shadow-none">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-xs">Filtros Avançados</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Filtrar por Período</DialogTitle>
                <DialogDescription>
                  Selecione o período que deseja analisar.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filter-type" className="text-right">Tipo</Label>
                  <div className="col-span-3">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger id="filter-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="year">Ano</SelectItem>
                        <SelectItem value="month">Mês</SelectItem>
                        <SelectItem value="week">Semana</SelectItem>
                        <SelectItem value="quarter">Trimestre</SelectItem>
                        <SelectItem value="semester">Semestre</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filterType !== "custom" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right">Ano</Label>
                    <div className="col-span-3">
                      <Select value={tempYear} onValueChange={setTempYear}>
                        <SelectTrigger id="year">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 10}, (_, i) => currentYear - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {(filterType === "month" || filterType === "week") && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="month" className="text-right">Mês</Label>
                    <div className="col-span-3">
                      <Select value={tempMonth} onValueChange={setTempMonth}>
                        <SelectTrigger id="month">
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Janeiro</SelectItem>
                          <SelectItem value="1">Fevereiro</SelectItem>
                          <SelectItem value="2">Março</SelectItem>
                          <SelectItem value="3">Abril</SelectItem>
                          <SelectItem value="4">Maio</SelectItem>
                          <SelectItem value="5">Junho</SelectItem>
                          <SelectItem value="6">Julho</SelectItem>
                          <SelectItem value="7">Agosto</SelectItem>
                          <SelectItem value="8">Setembro</SelectItem>
                          <SelectItem value="9">Outubro</SelectItem>
                          <SelectItem value="10">Novembro</SelectItem>
                          <SelectItem value="11">Dezembro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {filterType === "week" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="week" className="text-right">Semana</Label>
                    <div className="col-span-3">
                      <Select value={tempWeek} onValueChange={setTempWeek}>
                        <SelectTrigger id="week">
                          <SelectValue placeholder="Semana" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {generateWeeksForMonth(tempYear, tempMonth).map((week) => (
                            <SelectItem key={week.value} value={week.value}>
                              {week.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {filterType === "quarter" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quarter" className="text-right">Trimestre</Label>
                    <div className="col-span-3">
                      <Select value={tempQuarter} onValueChange={setTempQuarter}>
                        <SelectTrigger id="quarter">
                          <SelectValue placeholder="Trimestre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">1º Trimestre (Jan - Mar)</SelectItem>
                          <SelectItem value="1">2º Trimestre (Abr - Jun)</SelectItem>
                          <SelectItem value="2">3º Trimestre (Jul - Set)</SelectItem>
                          <SelectItem value="3">4º Trimestre (Out - Dez)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {filterType === "semester" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="semester" className="text-right">Semestre</Label>
                    <div className="col-span-3">
                      <Select value={tempSemester} onValueChange={setTempSemester}>
                        <SelectTrigger id="semester">
                          <SelectValue placeholder="Semestre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">1º Semestre (Jan - Jun)</SelectItem>
                          <SelectItem value="1">2º Semestre (Jul - Dez)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {filterType === "custom" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right shrink-0">Período</Label>
                    <div className="col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            size="sm"
                            className={cn(
                              "w-[130px] justify-start text-left font-normal px-3",
                              !tempStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs truncate">{tempStartDate ? format(tempStartDate, "dd/MM/yyyy") : "Inicial"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempStartDate}
                            onSelect={setTempStartDate}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <span className="hidden sm:inline-block text-muted-foreground text-xs font-medium shrink-0">-</span>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            size="sm"
                            className={cn(
                              "w-[130px] justify-start text-left font-normal px-3",
                              !tempEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs truncate">{tempEndDate ? format(tempEndDate, "dd/MM/yyyy") : "Final"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempEndDate}
                            onSelect={setTempEndDate}
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleApplyFilter}>Aplicar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="ml-2 text-xs font-medium text-muted-foreground flex items-center bg-muted/50 px-3 py-1.5 rounded-md border whitespace-nowrap shrink-0">
             {startDate ? format(startDate, "dd/MM/yyyy") : "--"} a {endDate ? format(endDate, "dd/MM/yyyy") : "--"}
          </div>

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
              <CardDescription className="font-medium">Total de Cliques</CardDescription>
              <CardTitle className="text-4xl text-blue-600 dark:text-blue-500">
                {loading ? <Skeleton className="h-10 w-16" /> : formatNumber(totalClicks)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total de Conversões</CardDescription>
              <CardTitle className="text-4xl text-emerald-600 dark:text-emerald-500">
                {loading ? <Skeleton className="h-10 w-24" /> : formatNumber(Number(totalConversions.toFixed(2)))}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Custo Total</CardDescription>
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
                    Nenhum dado encontrado para este período.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {result.segments.month}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(Number(result.metrics.clicks || 0))}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">
                      {result.metrics.conversions ? result.metrics.conversions.toFixed(2) : "0"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {result.metrics.costPerConversion ? formatCurrency(result.metrics.costPerConversion) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {result.metrics.averageCpc ? formatCurrency(result.metrics.averageCpc) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-purple-600">
                      {formatCurrency(Number(result.metrics.costMicros || 0))}
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