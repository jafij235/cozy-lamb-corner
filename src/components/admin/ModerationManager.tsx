import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const ModerationManager = () => {
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ["reports-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          prayer_request:prayer_requests(content, user_id)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async ({ reportId, prayerRequestId }: { reportId: string; prayerRequestId: string }) => {
      // Delete the prayer request
      const { error: deleteError } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", prayerRequestId);
      
      if (deleteError) throw deleteError;

      // Delete the report
      const { error: reportError } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);
      
      if (reportError) throw reportError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports-admin"] });
      toast.success("Comentário excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir comentário");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderação de Comentários</CardTitle>
        <CardDescription>
          Gerencie denúncias e comentários reportados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma denúncia pendente no momento
          </p>
        ) : (
          <div className="space-y-4">
            {reports.map((report: any) => (
              <div
                key={report.id}
                className="border border-destructive/20 rounded-lg p-4 bg-destructive/5"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive mb-2">
                      Motivo: {report.reason}
                    </p>
                    <div className="bg-card p-3 rounded border">
                      <p className="text-sm">
                        {report.prayer_request?.content || "Conteúdo removido"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Denunciado em {new Date(report.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      deleteCommentMutation.mutate({
                        reportId: report.id,
                        prayerRequestId: report.prayer_request_id,
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Comentário
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
