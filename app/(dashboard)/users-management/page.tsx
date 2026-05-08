"use client";

import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  CircleCheck,
  CircleX,
  Pencil,
  ShieldCheck,
  ShieldClose,
  Trash2,
} from "lucide-react";
import {Header} from "@/components/header";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "ADMIN" | "USER";
  enabled: boolean;
}

export default function Page() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (session?.accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then((res) => res.json())
        .then(setUsers);
    }
  }, [session?.accessToken]);

  return (
      <div className="flex flex-1 flex-col">
        <Header />
        <div className="flex flex-1 flex-col p-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-center">#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-center">Administrador</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge>{user.username}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {user.role === "ADMIN" ? (
                          <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ShieldClose className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {user.enabled ? (
                          <CircleCheck className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <CircleX className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
    </div>
  );
}
