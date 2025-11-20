import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, LogOut, UserCircle } from "lucide-react";
import { PrayerList } from "@/components/user/PrayerList";
import { DevotionalPlan } from "@/components/user/DevotionalPlan";
import { DailyChallenges } from "@/components/user/DailyChallenges";
import { PrayerCommunity } from "@/components/user/PrayerCommunity";
import { ProfileSetup } from "@/components/user/ProfileSetup";
import { MedalCollection } from "@/components/user/MedalCollection";
import { AchievementDisplay } from "@/components/user/AchievementDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile && !profile.username) {
      setProfileOpen(true);
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="text-2xl">✦</span>
            <span className="font-semibold text-lg">Jornada Espiritual</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setProfileOpen(true)}>
              <UserCircle className="w-4 h-4 mr-2" />
              Perfil
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Olá!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo à sua jornada de fé
          </p>
        </div>

        <Tabs defaultValue="oracoes" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="oracoes">
              <span className="mr-2">♪</span>
              Orações
            </TabsTrigger>
            <TabsTrigger value="familia">
              <span className="mr-2">⌂</span>
              Família
            </TabsTrigger>
            <TabsTrigger value="devocionais">
              <BookOpen className="w-4 h-4 mr-2" />
              Devocionais
            </TabsTrigger>
            <TabsTrigger value="desafios">
              <span className="mr-2">✦</span>
              Desafios
            </TabsTrigger>
            <TabsTrigger value="comunidade">
              <span className="mr-2">✧</span>
              Comunidade
            </TabsTrigger>
            <TabsTrigger value="medalhas">
              <span className="mr-2">◈</span>
              Medalhas
            </TabsTrigger>
            <TabsTrigger value="conquistas">
              <span className="mr-2">🏆</span>
              Conquistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oracoes" className="mt-6">
            <PrayerList type="individual" />
          </TabsContent>

          <TabsContent value="familia" className="mt-6">
            <PrayerList type="family" />
          </TabsContent>

          <TabsContent value="devocionais" className="mt-6">
            <DevotionalPlan />
          </TabsContent>

          <TabsContent value="desafios" className="mt-6">
            <DailyChallenges />
          </TabsContent>

          <TabsContent value="comunidade" className="mt-6">
            <PrayerCommunity />
          </TabsContent>

          <TabsContent value="medalhas" className="mt-6">
            <MedalCollection />
          </TabsContent>

          <TabsContent value="conquistas" className="mt-6">
            <AchievementDisplay />
          </TabsContent>
        </Tabs>
      </main>

      <ProfileSetup 
        open={profileOpen} 
        onOpenChange={setProfileOpen}
        currentUsername={profile?.username}
        currentAvatar={profile?.avatar_url}
      />
    </div>
  );
};

export default Home;
