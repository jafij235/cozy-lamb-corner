import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { MEDALS, MedalTier } from "@/hooks/useCompletions";
import { Award } from "lucide-react";

interface AdminAwardMedalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const AdminAwardMedal = ({ open, onOpenChange, userId }: AdminAwardMedalProps) => {
  const [medalType, setMedalType] = useState<"existing" | "custom">("existing");
  const [selectedMedal, setSelectedMedal] = useState<MedalTier>("bronze");
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("");
  const queryClient = useQueryClient();

  const { data: userMedals } = useQuery({
    queryKey: ["user-medals", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_medals")
        .select("medal_tier, custom_name")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const awardMedalMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      if (medalType === "existing") {
        // Verificar se já tem essa medalha
        const hasMedal = userMedals?.some(m => m.medal_tier === selectedMedal && !m.custom_name);
        if (hasMedal) {
          throw new Error("Usuário já possui esta medalha");
        }

        const { error } = await supabase
          .from("user_medals")
          .insert({
            user_id: userId,
            medal_tier: selectedMedal,
            awarded_by: user.id,
          });

        if (error) throw error;
      } else {
        if (!customName || !customIcon) {
          throw new Error("Nome e símbolo são obrigatórios");
        }

        const { error } = await supabase
          .from("user_medals")
          .insert({
            user_id: userId,
            medal_tier: "bronze", // valor padrão para medalhas custom
            custom_name: customName,
            custom_icon: customIcon,
            awarded_by: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Medalha entregue com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["user-medals", userId] });
      onOpenChange(false);
      setCustomName("");
      setCustomIcon("");
      setMedalType("existing");
    },
    onError: (error: Error) => {
      toast.error("Erro ao entregar medalha: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Entregar Medalha
          </DialogTitle>
          <DialogDescription>
            Escolha uma medalha existente ou crie uma personalizada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={medalType} onValueChange={(value) => setMedalType(value as "existing" | "custom")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">Medalha Existente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Medalha Personalizada</Label>
            </div>
          </RadioGroup>

          {medalType === "existing" ? (
            <div className="space-y-3">
              <Label>Selecione a Medalha</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {MEDALS.map((medal) => {
                  const hasMedal = userMedals?.some(m => m.medal_tier === medal.tier && !m.custom_name);
                  
                  return (
                    <button
                      key={medal.tier}
                      onClick={() => setSelectedMedal(medal.tier)}
                      disabled={hasMedal}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedMedal === medal.tier
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      } ${hasMedal ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="text-center space-y-1">
                        <div className="text-3xl">{medal.icon}</div>
                        <div className="text-xs font-medium">{medal.name}</div>
                        {hasMedal && (
                          <div className="text-xs text-muted-foreground">Já possui</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-name">Nome da Medalha</Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Campeão da Oração"
                  maxLength={30}
                />
              </div>
              <div>
                <Label htmlFor="custom-icon">Símbolo (emoji ou caractere único)</Label>
                <Input
                  id="custom-icon"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value.slice(0, 2))}
                  placeholder="Ex: 🏆"
                  maxLength={2}
                  className="text-2xl"
                />
              </div>
              {customIcon && (
                <div className="p-4 border rounded-lg">
                  <Label className="text-sm text-muted-foreground">Preview:</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-4xl">{customIcon}</div>
                    <div className="font-semibold">{customName || "Nome da medalha"}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => awardMedalMutation.mutate()}
            disabled={awardMedalMutation.isPending || (medalType === "custom" && (!customName || !customIcon))}
          >
            {awardMedalMutation.isPending ? "Entregando..." : "Entregar Medalha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
