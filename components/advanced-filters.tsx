import { useState, useEffect } from "react";
import { format, getWeek, setWeek, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Filter, Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface AdvancedFiltersProps {
  initialStartDate?: Date;
  initialEndDate?: Date;
  onApply: (startDate: Date, endDate: Date) => void;
}

export function AdvancedFilters({ initialStartDate, initialEndDate, onApply }: AdvancedFiltersProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("month");
  
  const [tempYear, setTempYear] = useState<string>(currentYear.toString());
  const [tempMonth, setTempMonth] = useState<string>(today.getMonth().toString());
  const [tempWeek, setTempWeek] = useState<string>(getWeek(today, { weekStartsOn: 1 }).toString());
  const [tempQuarter, setTempQuarter] = useState<string>(Math.floor(today.getMonth() / 3).toString());
  const [tempSemester, setTempSemester] = useState<string>(Math.floor(today.getMonth() / 6).toString());
  
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(initialStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(initialEndDate);

  useEffect(() => {
    if (isModalOpen) {
      setTempStartDate(initialStartDate);
      setTempEndDate(initialEndDate);
    }
  }, [isModalOpen, initialStartDate, initialEndDate]);

  const generateWeeksForMonth = (yearStr: string, monthStr: string) => {
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const weeks = [];
    
    let currentDate = startOfWeek(new Date(year, month, 1), { weekStartsOn: 1 });
    const endDate = new Date(year, month + 1, 0); 
    
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
      newEnd = new Date(year, month + 1, 0);
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

    if (newStart && newEnd) {
      onApply(newStart, newEnd);
    }
    setIsModalOpen(false);
  };

  return (
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
            Selecione o formato de busca e o período que deseja analisar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-5 py-4">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="filter-type" className="text-sm font-medium">Formato de busca</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filter-type" className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Por Ano</SelectItem>
                <SelectItem value="semester">Por Semestre</SelectItem>
                <SelectItem value="quarter">Por Trimestre</SelectItem>
                <SelectItem value="month">Por Mês</SelectItem>
                <SelectItem value="week">Por Semana</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filterType !== "custom" && (
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="year" className="text-sm font-medium">Ano</Label>
                <Select value={tempYear} onValueChange={setTempYear}>
                  <SelectTrigger id="year" className="w-full">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 10}, (_, i) => currentYear - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(filterType === "month" || filterType === "week") && (
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="month" className="text-sm font-medium">Mês</Label>
                <Select value={tempMonth} onValueChange={setTempMonth}>
                  <SelectTrigger id="month" className="w-full">
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
            )}

            {filterType === "quarter" && (
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="quarter" className="text-sm font-medium">Trimestre</Label>
                <Select value={tempQuarter} onValueChange={setTempQuarter}>
                  <SelectTrigger id="quarter" className="w-full">
                    <SelectValue placeholder="Trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">1º Trimestre</SelectItem>
                    <SelectItem value="1">2º Trimestre</SelectItem>
                    <SelectItem value="2">3º Trimestre</SelectItem>
                    <SelectItem value="3">4º Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterType === "semester" && (
              <div className="flex flex-col gap-2.5">
                <Label htmlFor="semester" className="text-sm font-medium">Semestre</Label>
                <Select value={tempSemester} onValueChange={setTempSemester}>
                  <SelectTrigger id="semester" className="w-full">
                    <SelectValue placeholder="Semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">1º Semestre</SelectItem>
                    <SelectItem value="1">2º Semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {filterType === "custom" && (
              <>
                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-medium">Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{tempStartDate ? format(tempStartDate, "dd/MM/yyyy") : "Selecione"}</span>
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
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-medium">Data Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{tempEndDate ? format(tempEndDate, "dd/MM/yyyy") : "Selecione"}</span>
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
              </>
            )}
          </div>

          {filterType === "week" && (
            <div className="flex flex-col gap-2.5 pt-1">
              <Label htmlFor="week" className="text-sm font-medium">Semana Específica</Label>
              <Select value={tempWeek} onValueChange={setTempWeek}>
                <SelectTrigger id="week" className="w-full">
                  <SelectValue placeholder="Selecione a semana" />
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
          )}
          
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          <Button className="ml-2" onClick={handleApplyFilter}>Aplicar Filtro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}