export const formatCurrency = (micros: number | string = 0) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(micros) / 1000000);

export const formatNumber = (num: number | string = 0) =>
    new Intl.NumberFormat('pt-BR').format(Number(num));

export const formatPercent = (val: number | string = 0) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(Number(val));

export const getStatusText = (status: string) => {
    const map: Record<string, string> = { ENABLED: "Ativa", PAUSED: "Pausada", REMOVED: "Removida" };
    return map[status] || status;
};

export const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
        ENABLED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        PAUSED: "bg-amber-50 text-amber-700 ring-amber-600/20",
        REMOVED: "bg-red-50 text-red-700 ring-red-600/20"
    };
    return map[status] || "bg-slate-50 text-slate-700 ring-slate-600/20";
};

export const formatMonthYear = (monthString: string) => {
    if (!monthString) return "";
    
    // Supondo o formato "YYYY-MM"
    const parts = monthString.split('-');
    if (parts.length !== 2) return monthString; // Retorna original se não for o formato esperado
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Meses no JS vão de 0 a 11
    
    const date = new Date(year, month);
    
    // Capitaliza a primeira letra: "janeiro de 2024" -> "Janeiro de 2024"
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};