import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Users, Flame, PlusCircle, Flag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const INTERACTIONS = [
  { type: "pray", label: "Estou orando por você", icon: Heart },
  { type: "support", label: "Estou com você", icon: Users },
  { type: "peace", label: "Paz pra sua casa", icon: Heart },
  { type: "strength", label: "Permaneça firme", icon: Flame },
];

export const PrayerCommunity = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prayerRequests = [] } = useQuery({
    queryKey: ["prayer-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select(`
          *,
          interactions(type, user_id)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from("prayer_requests")
        .insert([{ content, user_id: user.id }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
      toast.success("Pedido de oração publicado!");
      setOpen(false);
      setContent("");
    },
    onError: () => {
      toast.error("Erro ao publicar pedido");
    },
  });

  const addInteractionMutation = useMutation({
    mutationFn: async ({ prayerRequestId, type }: { prayerRequestId: string; type: string }) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from("interactions")
        .insert([{ prayer_request_id: prayerRequestId, user_id: user.id, type }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
      toast.success("Interação enviada com amor! 💙");
    },
    onError: () => {
      toast.error("Erro ao enviar interação");
    },
  });

  const reportMutation = useMutation({
    mutationFn: async ({ prayerRequestId, reason }: { prayerRequestId: string; reason: string }) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from("reports")
        .insert([{ prayer_request_id: prayerRequestId, user_id: user.id, reason }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Denúncia enviada. Obrigado por manter nossa comunidade segura.");
      setReportOpen(false);
      setReportReason("");
      setReportingId(null);
    },
    onError: () => {
      toast.error("Erro ao enviar denúncia");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.length > 700) {
      toast.error("Seu pedido deve ter no máximo 700 caracteres");
      return;
    }

    if (content.match(/https?:\/\//)) {
      toast.error("Links não são permitidos");
      return;
    }

    createRequestMutation.mutate(content);
  };

  const handleReport = (prayerRequestId: string) => {
    setReportingId(prayerRequestId);
    setReportOpen(true);
  };

  const submitReport = () => {
    if (!reportingId || !reportReason.trim()) return;
    reportMutation.mutate({ prayerRequestId: reportingId, reason: reportReason });
  };

  const getInteractionCount = (interactions: any[], type: string) => {
    return interactions?.filter((i: any) => i.type === type).length || 0;
  };

  const hasUserInteracted = (interactions: any[], type: string) => {
    return interactions?.some((i: any) => i.type === type && i.user_id === user?.id);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comunidade de Oração</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Pedir Oração
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Compartilhe seu Pedido de Oração</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Compartilhe seu pedido de oração... (máximo 700 caracteres)"
                      rows={6}
                      maxLength={700}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {content.length}/700 caracteres
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Publicar Pedido
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {prayerRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum pedido de oração no momento. Seja o primeiro!
            </p>
          </CardContent>
        </Card>
      ) : (
        prayerRequests.map((request: any) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <p className="text-foreground mb-4 whitespace-pre-wrap">
                {request.content}
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERACTIONS.map(({ type, label, icon: Icon }) => {
                  const count = getInteractionCount(request.interactions, type);
                  const hasInteracted = hasUserInteracted(request.interactions, type);
                  
                  return (
                    <Button
                      key={type}
                      variant={hasInteracted ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        addInteractionMutation.mutate({ prayerRequestId: request.id, type })
                      }
                      disabled={hasInteracted}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {label}
                      {count > 0 && <span className="ml-1">({count})</span>}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReport(request.id)}
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar Conteúdo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Por favor, descreva o motivo da denúncia..."
              rows={4}
              required
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReportOpen(false);
                  setReportReason("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={submitReport} className="flex-1">
                Enviar Denúncia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
