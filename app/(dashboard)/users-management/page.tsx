"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ShieldCheck, ShieldClose, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";

export default function Page() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = session?.accessToken;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/all`;

    if (token) {
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUsers);
    }
  }, [session]);

  return (
    <div className="p-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any, index: number) => (
              <TableRow key={user.id}>
                <TableCell>
                  {/*  Fazer contador*/}
                  { index + 1}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role == "ADMIN" ? "Administrador" : "Usuário" }</TableCell>
                <TableCell>
                  {user.enabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldClose className="h-5 w-5" />}
                </TableCell>
                <TableCell>
                  <Button>
                    <Pencil className="h-5 w-5"/>
                  </Button>
                  <Button>
                    <Trash2 className="h-5 w-5"/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
