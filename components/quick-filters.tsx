import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";

interface QuickFiltersProps {
  onDateChange: (startDate: Date, endDate: Date) => void;
}

export function QuickFilters({ onDateChange }: QuickFiltersProps) {
  const handlePresetChange = (preset: string) => {
    const todayDate = new Date();
    
    switch (preset) {
      case "today":
        onDateChange(todayDate, todayDate);
        break;
      case "yesterday":
        const yesterday = subDays(todayDate, 1);
        onDateChange(yesterday, yesterday);
        break;
      case "thisWeek":
        onDateChange(
          startOfWeek(todayDate, { weekStartsOn: 1 }),
          endOfWeek(todayDate, { weekStartsOn: 1 })
        );
        break;
      case "lastWeek":
        const lastWeek = subWeeks(todayDate, 1);
        onDateChange(
          startOfWeek(lastWeek, { weekStartsOn: 1 }),
          endOfWeek(lastWeek, { weekStartsOn: 1 })
        );
        break;
      case "thisMonth":
        onDateChange(startOfMonth(todayDate), endOfMonth(todayDate));
        break;
      case "lastMonth":
        const lastMonth = subMonths(todayDate, 1);
        onDateChange(startOfMonth(lastMonth), endOfMonth(lastMonth));
        break;
      case "thisSemester":
        const currentMonth = todayDate.getMonth();
        if (currentMonth < 6) {
          onDateChange(
            new Date(todayDate.getFullYear(), 0, 1),
            new Date(todayDate.getFullYear(), 5, 30)
          );
        } else {
          onDateChange(
            new Date(todayDate.getFullYear(), 6, 1),
            new Date(todayDate.getFullYear(), 11, 31)
          );
        }
        break;
      case "lastSemester":
        const month = todayDate.getMonth();
        if (month < 6) {
          onDateChange(
            new Date(todayDate.getFullYear() - 1, 6, 1),
            new Date(todayDate.getFullYear() - 1, 11, 31)
          );
        } else {
          onDateChange(
            new Date(todayDate.getFullYear(), 0, 1),
            new Date(todayDate.getFullYear(), 5, 30)
          );
        }
        break;
      case "thisYear":
        onDateChange(startOfYear(todayDate), endOfYear(todayDate));
        break;
      case "lastYear":
        const lastYear = subYears(todayDate, 1);
        onDateChange(startOfYear(lastYear), endOfYear(lastYear));
        break;
    }
  };

  return (
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
  );
}