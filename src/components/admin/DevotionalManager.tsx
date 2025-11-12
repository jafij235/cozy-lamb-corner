import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const DevotionalManager = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    order: 0,
    active: true,
  });

  const queryClient = useQueryClient();

  const { data: devotionals = [] } = useQuery({
    queryKey: ["devotionals-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .order("order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("devotionals").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals-admin"] });
      toast.success("Devocional criado com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar devocional");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("devotionals")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals-admin"] });
      toast.success("Devocional atualizado!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar devocional");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devotionals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals-admin"] });
      toast.success("Devocional excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir devocional");
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", order: 0, active: true });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (devotional: any) => {
    setEditingId(devotional.id);
    setFormData({
      title: devotional.title,
      content: devotional.content,
      order: devotional.order,
      active: devotional.active,
    });
    setOpen(true);
  };

  const toggleActive = (id: string, active: boolean) => {
    updateMutation.mutate({ id, data: { active: !active } });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Devocionais</CardTitle>
            <CardDescription>
              Adicione, edite ou desative devocionais
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Devocional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Devocional" : "Novo Devocional"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Ordem de Exibição</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="active">Ativo</Label>
                    <div className="flex items-center h-10">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {devotionals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum devocional cadastrado ainda
          </p>
        ) : (
          <div className="space-y-3">
            {devotionals.map((devotional) => (
              <div
                key={devotional.id}
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
              >
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                <div className="flex-1">
                  <h4 className="font-medium">{devotional.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {devotional.content}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={devotional.active}
                    onCheckedChange={() => toggleActive(devotional.id, devotional.active)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(devotional)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(devotional.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
