import { format } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCampaignInfo(id: string, accessToken: string) {
    const infoQuery = `SELECT campaign.id, campaign.name, campaign.status FROM campaign WHERE campaign.id = ${id}`;
    const response = await fetch(`${API_BASE_URL}/google-ads/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ query: infoQuery }),
    });
    const data = await response.json();
    return data.results?.[0]?.campaign || null;
}

export async function fetchCombinedMetrics(id: string, startDate: Date | null, endDate: Date | null, accessToken: string) {
    const startStr = startDate ? format(startDate, "yyyy-MM-dd") : "2010-01-01";
    const endStr = endDate ? format(endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

    const adsQuery = `SELECT segments.month, metrics.clicks, metrics.impressions, metrics.cost_micros FROM campaign WHERE campaign.id = ${id} AND segments.date BETWEEN '${startStr}' AND '${endStr}' ORDER BY segments.month DESC`;

    const [adsRes, internalRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ query: adsQuery }),
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/campaign-stats/id/${id}?startDate=${startStr}&endDate=${endStr}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
    ]);

    const adsData = await adsRes.json();
    const internalStats = await internalRes.json();

    const googleResults = adsData.results || [];

    // Fazendo o merge omitindo o dia do Google Ads
    return googleResults.map((adItem: any) => {
        // Transforma "2025-05-01" em "2025-05"
        const monthKey = adItem.segments.month.substring(0, 7);

        // Procura na sua lista do Spring Boot pelo mês correspondente
        const match = internalStats.find((s: any) => s.referenceDate === monthKey);

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