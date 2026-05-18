import { format } from "date-fns";
import { apiFetch } from "./api";

export async function fetchCampaignInfo(id: string, accessToken: string) {
    const infoQuery = `SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.id = ${id}`;
    
    const data = await apiFetch('/google-ads/search', {
        method: 'POST',
        accessToken,
        body: { query: infoQuery }
    });

    return data?.results?.[0]?.campaign || null;
}

export async function fetchCombinedMetrics(id: string, startDate: Date | null, endDate: Date | null, accessToken: string) {
    const startStr = startDate ? format(startDate, "yyyy-MM-dd") : "2010-01-01";
    const endStr = endDate ? format(endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

    const adsQuery = `SELECT segments.month, metrics.clicks, metrics.impressions, metrics.cost_micros FROM campaign WHERE campaign.id = ${id} AND segments.date BETWEEN '${startStr}' AND '${endStr}' ORDER BY segments.month DESC`;

    const [adsData, internalStats] = await Promise.all([
        apiFetch('/google-ads/search', {
            method: 'POST',
            accessToken,
            body: { query: adsQuery }
        }),
        apiFetch(`/google-ads/campaign-stats/id/${id}?startDate=${startStr}&endDate=${endStr}`, {
            method: 'GET',
            accessToken
        })
    ]);

    const googleResults = adsData?.results || [];
    const safeInternalStats = Array.isArray(internalStats) ? internalStats : [];

    // Fazendo o merge omitindo o dia do Google Ads
    return googleResults.map((adItem: any) => {
        // Transforma "2025-05-01" em "2025-05"
        const monthKey = adItem.segments.month.substring(0, 7);

        // Procura na sua lista do Spring Boot pelo mês correspondente
        const match = safeInternalStats.find((s: any) => s.referenceDate === monthKey);

        return {
            month: monthKey, // Agora exposto apenas como YYYY-MM
            impressions: Number(adItem.metrics.impressions || 0),
            clicks: Number(adItem.metrics.clicks || 0),
            costMicros: Number(adItem.metrics.costMicros || 0),
            leads: match?.leads || 0,
            sales: match?.sales || 0,
            hasInternalData: !!match
        };
    });
}

export async function fetchMonthlyChartMetrics(accessToken: string, startDate: Date, endDate: Date) {
    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    const query = `SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros, segments.month FROM customer WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`;

    const json = await apiFetch('/google-ads/search', {
        method: "POST",
        accessToken,
        body: { query },
    });

    return json?.results || [];
}

export async function fetchCampaignsWithMetrics(accessToken: string, startDate: Date | null, endDate: Date | null) {
    let dateFilter = "";
    if (startDate && endDate) {
        const startStr = format(startDate, "yyyy-MM-dd");
        const endStr = format(endDate, "yyyy-MM-dd");
        dateFilter = ` AND segments.date BETWEEN '${startStr}' AND '${endStr}'`;
    }

    const query = `SELECT campaign.id, campaign.name, campaign.status, metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros FROM campaign WHERE campaign.status != 'REMOVED'${dateFilter}`;

    const data = await apiFetch('/google-ads/search', {
        method: 'POST',
        accessToken,
        body: { query }
    });

    return data?.results || [];
}

export async function fetchGeneralMetrics(accessToken: string, startDate: Date | null, endDate: Date | null) {
    let query = "SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros FROM customer";
    if (startDate && endDate) {
        query = `SELECT metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.cost_micros FROM customer WHERE segments.date BETWEEN '${format(startDate, "yyyy-MM-dd")}' AND '${format(endDate, "yyyy-MM-dd")}'`;
    }

    const data = await apiFetch('/google-ads/search', {
        method: 'POST',
        accessToken,
        body: { query }
    });

    return data?.results?.[0]?.metrics || null;
}
