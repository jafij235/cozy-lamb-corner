import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity } from "lucide-react";

export const LoginMonitor = () => {
  const { data: loginStats, isLoading } = useQuery({
    queryKey: ["login-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_login_stats");

      if (error) throw error;
      return data;
    },
  });

  const { data: recentLogins } = useQuery({
    queryKey: ["recent-logins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_sessions")
        .select("*, profiles:user_id(email, username)")
        .eq("is_active", true)
        .order("login_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center">Carregando estatísticas de login...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Estatísticas de Login por Usuário
          </CardTitle>
          <CardDescription>
            Monitore acessos e identifique múltiplos IPs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome de Usuário</TableHead>
                <TableHead>Total de Logins</TableHead>
                <TableHead>IPs Únicos</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginStats?.map((stat) => (
                <TableRow key={stat.user_id}>
                  <TableCell>{stat.email}</TableCell>
                  <TableCell>{stat.username || "N/A"}</TableCell>
                  <TableCell>{stat.total_logins}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {stat.unique_ips}
                    {stat.unique_ips > 3 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {stat.unique_ips} IPs
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(stat.last_login).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {stat.unique_ips > 3 ? (
                      <Badge variant="destructive">Suspeito</Badge>
                    ) : (
                      <Badge variant="secondary">Normal</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logins Recentes</CardTitle>
          <CardDescription>
            Últimos 20 acessos ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogins?.map((login: any) => (
                <TableRow key={login.id}>
                  <TableCell>{login.profiles?.email}</TableCell>
                  <TableCell className="font-mono text-sm">{login.ip_address}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                    {login.user_agent || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(login.login_at).toLocaleString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
