import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const PrayerManager = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "individual",
    audio_url: "",
    image_url: "",
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: prayers = [] } = useQuery({
    queryKey: ["prayers-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prayers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("prayers").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers-admin"] });
      toast.success("Oração criada com sucesso!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar oração");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("prayers")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers-admin"] });
      toast.success("Oração atualizada!");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar oração");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prayers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers-admin"] });
      toast.success("Oração excluída!");
    },
    onError: () => {
      toast.error("Erro ao excluir oração");
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", type: "individual", audio_url: "", image_url: "" });
    setEditingId(null);
    setAudioFile(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let audio_url = formData.audio_url;
      let image_url = formData.image_url;

      if (audioFile) {
        audio_url = await uploadFile(audioFile, "prayer-audios");
      }

      if (imageFile) {
        image_url = await uploadFile(imageFile, "prayer-images");
      }

      const data = { ...formData, audio_url, image_url };

      if (editingId) {
        updateMutation.mutate({ id: editingId, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      toast.error("Erro ao fazer upload dos arquivos");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (prayer: any) => {
    setEditingId(prayer.id);
    setFormData({
      title: prayer.title,
      description: prayer.description,
      type: prayer.type,
      audio_url: prayer.audio_url,
      image_url: prayer.image_url,
    });
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Orações</CardTitle>
            <CardDescription>
              Adicione, edite ou remova orações (individuais e em família)
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Oração
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Oração" : "Nova Oração"}
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
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="family">Em Família</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audio">Áudio (MP3/WAV)</Label>
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/mp3,.mp3,.wav"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  />
                  {formData.audio_url && !audioFile && (
                    <p className="text-xs text-muted-foreground">Áudio atual mantido</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Imagem (1:1 thumbnail)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {formData.image_url && !imageFile && (
                    <p className="text-xs text-muted-foreground">Imagem atual mantida</p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Enviando..." : editingId ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {prayers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma oração cadastrada ainda
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {prayers.map((prayer) => (
              <div key={prayer.id} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <img
                  src={prayer.image_url}
                  alt={prayer.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{prayer.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {prayer.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {prayer.type === "individual" ? "Individual" : "Em Família"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(prayer)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(prayer.id)}
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
