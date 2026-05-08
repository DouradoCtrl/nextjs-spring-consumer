"use client";

import { Header } from "@/components/header";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CircleCheck, CirclePause, Search } from "lucide-react";

interface Campaign {
  resourceName: string;
  id: string;
  name: string;
  status: string;
}

interface CampaignResult {
  campaign: Campaign;
}

interface GoogleAdsResponse {
  results: CampaignResult[];
  fieldMask?: string;
  queryResourceConsumption?: string;
}

export default function Page() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<CampaignResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = (session as any)?.accessToken;
    if (accessToken) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-ads/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: "SELECT campaign.id, campaign.name, campaign.status FROM campaign",
        }),
      })
        .then((res) => res.json())
        .then((data: GoogleAdsResponse) => {
          if (data.results) {
            setCampaigns(data.results);
          }
        })
        .catch((error) => console.error("Erro ao buscar campanhas:", error))
        .finally(() => setLoading(false));
    } else if (session === null) {
      setLoading(false);
    }
  }, [session]);

  const activeCampaigns = campaigns.filter(
    (c) => c.campaign.status === "ENABLED"
  ).length;
  const pausedCampaigns = campaigns.filter(
    (c) => c.campaign.status === "PAUSED"
  ).length;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Campanhas</CardDescription>
              <CardTitle className="text-4xl">{loading ? <Skeleton className="h-10 w-16" /> : campaigns.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Campanhas Ativas</CardDescription>
              <CardTitle className="text-4xl text-green-600 dark:text-green-500">
                {loading ? <Skeleton className="h-10 w-16" /> : activeCampaigns}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Campanhas Pausadas</CardDescription>
              <CardTitle className="text-4xl text-yellow-600 dark:text-yellow-500">
                {loading ? <Skeleton className="h-10 w-16" /> : pausedCampaigns}
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
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex justify-center items-center h-full space-x-2">
                                <Skeleton className="h-8 w-full max-w-125" />
                            </div>
                        </TableCell>
                    </TableRow>
                ) : campaigns.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
                        <TableCell>
                        <div className="flex justify-center">
                            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => console.log('Ver detalhes', result.campaign.id)}>
                            <Search className="h-3.5 w-3.5" />
                            <span>Detalhes</span>
                            </Button>
                        </div>
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