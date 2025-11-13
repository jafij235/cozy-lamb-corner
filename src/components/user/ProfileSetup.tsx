import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { validateUsername } from "@/lib/profanityFilter";

const CARTOON_AVATARS = [
  // Male avatars
  { id: "boy1", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=boy1&backgroundColor=b6e3f4", gender: "male" },
  { id: "boy2", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=boy2&backgroundColor=d1d4f9", gender: "male" },
  { id: "boy3", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=boy3&backgroundColor=ffd5dc", gender: "male" },
  { id: "boy4", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=boy4&backgroundColor=c0aede", gender: "male" },
  { id: "boy5", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=boy5&backgroundColor=ffdfbf", gender: "male" },
  // Female avatars
  { id: "girl1", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=girl1&backgroundColor=ffd5dc", gender: "female" },
  { id: "girl2", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=girl2&backgroundColor=c0aede", gender: "female" },
  { id: "girl3", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=girl3&backgroundColor=b6e3f4", gender: "female" },
  { id: "girl4", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=girl4&backgroundColor=ffdfbf", gender: "female" },
  { id: "girl5", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=girl5&backgroundColor=d1d4f9", gender: "female" },
];

interface ProfileSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername?: string;
  currentAvatar?: string;
}

export const ProfileSetup = ({ open, onOpenChange, currentUsername, currentAvatar }: ProfileSetupProps) => {
  const [username, setUsername] = useState(currentUsername || "");
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || CARTOON_AVATARS[0].url);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) return;

    const validation = validateUsername(username);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          avatar_url: selectedAvatar,
        } as any)
        .eq("id", user.id);

      if (error) {
        if (error.code === "23505") {
          toast.error("Este nome já está em uso");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Perfil atualizado!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar perfil");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure seu Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Seu Nome</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              Use apenas letras, números e espaços (3-20 caracteres)
            </p>
          </div>

          <div className="space-y-3">
            <Label>Escolha seu Avatar</Label>
            <div className="grid grid-cols-5 gap-3">
              {CARTOON_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`relative rounded-full overflow-hidden border-4 transition-all hover:scale-110 ${
                    selectedAvatar === avatar.url
                      ? "border-primary shadow-lg"
                      : "border-border"
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={`Avatar ${avatar.id}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Escolha um personagem que represente você! ✨
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
