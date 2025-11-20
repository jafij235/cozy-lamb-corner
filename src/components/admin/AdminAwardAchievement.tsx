import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

interface AdminAwardAchievementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const AdminAwardAchievement = ({ open, onOpenChange, userId }: AdminAwardAchievementProps) => {
  const [achievementType, setAchievementType] = useState<"existing" | "custom">("existing");
  const [selectedAchievement, setSelectedAchievement] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customIcon, setCustomIcon] = useState("");
  const [customCategory, setCustomCategory] = useState<"devotion" | "community">("devotion");
  const queryClient = useQueryClient();

  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_value", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: userAchievements } = useQuery({
    queryKey: ["user-achievements-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const awardAchievementMutation = useMutation({
    mutationFn: async () => {
      if (achievementType === "existing") {
        if (!selectedAchievement) {
          throw new Error("Selecione uma conquista");
        }

        const hasAchievement = userAchievements?.some(ua => ua.achievement_id === selectedAchievement);
        if (hasAchievement) {
          throw new Error("Usuário já possui esta conquista");
        }

        const { error } = await supabase
          .from("user_achievements")
          .insert({
            user_id: userId,
            achievement_id: selectedAchievement,
          });

        if (error) throw error;
      } else {
        if (!customName || !customDescription || !customIcon) {
          throw new Error("Todos os campos são obrigatórios");
        }

        // Criar conquista personalizada
        const { data: newAchievement, error: achievementError } = await supabase
          .from("achievements")
          .insert({
            name: customName,
            description: customDescription,
            icon: customIcon,
            category: customCategory,
            requirement_type: "custom",
            requirement_value: 0,
          })
          .select()
          .single();

        if (achievementError) throw achievementError;

        // Entregar ao usuário
        const { error: userError } = await supabase
          .from("user_achievements")
          .insert({
            user_id: userId,
            achievement_id: newAchievement.id,
          });

        if (userError) throw userError;
      }
    },
    onSuccess: () => {
      toast.success("Conquista entregue com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["user-achievements-admin", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-achievements", userId] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      onOpenChange(false);
      setCustomName("");
      setCustomDescription("");
      setCustomIcon("");
      setCustomCategory("devotion");
      setSelectedAchievement("");
      setAchievementType("existing");
    },
    onError: (error: Error) => {
      toast.error("Erro ao entregar conquista: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Entregar Conquista
          </DialogTitle>
          <DialogDescription>
            Escolha uma conquista existente ou crie uma personalizada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={achievementType} onValueChange={(value) => setAchievementType(value as "existing" | "custom")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing-achievement" />
              <Label htmlFor="existing-achievement">Conquista Existente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom-achievement" />
              <Label htmlFor="custom-achievement">Conquista Personalizada</Label>
            </div>
          </RadioGroup>

          {achievementType === "existing" ? (
            <div className="space-y-3">
              <Label>Selecione a Conquista</Label>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {achievements?.map((achievement) => {
                  const hasAchievement = userAchievements?.some(ua => ua.achievement_id === achievement.id);
                  
                  return (
                    <button
                      key={achievement.id}
                      onClick={() => setSelectedAchievement(achievement.id)}
                      disabled={hasAchievement}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedAchievement === achievement.id
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      } ${hasAchievement ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{achievement.name}</div>
                          <div className="text-sm text-muted-foreground">{achievement.description}</div>
                          {hasAchievement && (
                            <div className="text-xs text-muted-foreground mt-1">Já possui</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="achievement-name">Nome da Conquista</Label>
                <Input
                  id="achievement-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Líder da Comunidade"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="achievement-description">Descrição</Label>
                <Textarea
                  id="achievement-description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Descreva o motivo desta conquista especial"
                  maxLength={200}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="achievement-icon">Símbolo (emoji ou caractere único)</Label>
                <Input
                  id="achievement-icon"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value.slice(0, 2))}
                  placeholder="Ex: 🌟"
                  maxLength={2}
                  className="text-2xl"
                />
              </div>
              <div>
                <Label htmlFor="achievement-category">Categoria</Label>
                <Select value={customCategory} onValueChange={(value) => setCustomCategory(value as "devotion" | "community")}>
                  <SelectTrigger id="achievement-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devotion">Devoção</SelectItem>
                    <SelectItem value="community">Comunidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {customIcon && customName && (
                <div className="p-4 border rounded-lg">
                  <Label className="text-sm text-muted-foreground">Preview:</Label>
                  <div className="flex items-start gap-3 mt-2">
                    <div className="text-4xl">{customIcon}</div>
                    <div>
                      <div className="font-semibold">{customName}</div>
                      <div className="text-sm text-muted-foreground">{customDescription || "Descrição da conquista"}</div>
                    </div>
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
            onClick={() => awardAchievementMutation.mutate()}
            disabled={
              awardAchievementMutation.isPending || 
              (achievementType === "existing" && !selectedAchievement) ||
              (achievementType === "custom" && (!customName || !customDescription || !customIcon))
            }
          >
            {awardAchievementMutation.isPending ? "Entregando..." : "Entregar Conquista"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
