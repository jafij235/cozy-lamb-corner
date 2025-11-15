import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, MessageSquare } from "lucide-react";

export const CommunityModeration = () => {
  const queryClient = useQueryClient();

  const { data: prayerRequests, isLoading } = useQuery({
    queryKey: ["admin-prayer-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select(`
          *,
          profiles:user_id (
            email,
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prayer-requests"] });
      toast.success("Pedido de oração excluído com sucesso");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });

  if (isLoading) {
    return <div className="text-center">Carregando pedidos de oração...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Moderação da Comunidade
        </CardTitle>
        <CardDescription>
          Gerencie todos os pedidos de oração da comunidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prayerRequests?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum pedido de oração encontrado
          </p>
        ) : (
          prayerRequests?.map((request: any) => (
            <Card key={request.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {request.profiles?.avatar_url && (
                        <img
                          src={request.profiles.avatar_url}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold">
                          {request.profiles?.username || request.profiles?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{request.content}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(request.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
