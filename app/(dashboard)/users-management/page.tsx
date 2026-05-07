"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {ShieldCheck, ShieldClose, Pencil, Trash2, CircleX, CircleCheck} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
            {users.map((user: any, index: number) => (
              <TableRow key={user.id}>
                <TableCell className="text-center">
                  {/*  Fazer contador*/}
                  { index + 1}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge>{user.username}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    {user.role == "ADMIN" ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldClose className="h-5 w-5 text-red-500" /> }
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    {user.enabled ? <CircleCheck className="h-5 w-5 text-green-500" /> : <CircleX className="h-5 w-5 text-red-500" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Button>
                      <Pencil className="h-5 w-5"/>
                    </Button>
                    <Button className="ml-1 bg-red-800 text-white">
                      <Trash2 className="h-5 w-5"/>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
