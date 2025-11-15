import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BookOpen, Flame, Music, Flag, LogOut, Users, Activity, MessageSquare } from "lucide-react";
import { ModerationManager } from "@/components/admin/ModerationManager";
import { DevotionalManager } from "@/components/admin/DevotionalManager";
import { ChallengeManager } from "@/components/admin/ChallengeManager";
import { PrayerManager } from "@/components/admin/PrayerManager";
import { AccountsManager } from "@/components/admin/AccountsManager";
import { LoginMonitor } from "@/components/admin/LoginMonitor";
import { CommunityModeration } from "@/components/admin/CommunityModeration";

const Admin = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-6 h-6" />
            <span className="font-semibold text-lg">Painel Administrativo</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Bem-vindo ao Painel Admin
          </h1>
          <p className="text-muted-foreground">
            Gerencie todo o conteúdo do aplicativo
          </p>
        </div>

        <Tabs defaultValue="moderacao" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="moderacao">
              <Flag className="w-4 h-4 mr-2" />
              Moderação
            </TabsTrigger>
            <TabsTrigger value="contas">
              <Users className="w-4 h-4 mr-2" />
              Contas
            </TabsTrigger>
            <TabsTrigger value="logins">
              <Activity className="w-4 h-4 mr-2" />
              Logins
            </TabsTrigger>
            <TabsTrigger value="comunidade">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comunidade
            </TabsTrigger>
            <TabsTrigger value="devocionais">
              <BookOpen className="w-4 h-4 mr-2" />
              Devocionais
            </TabsTrigger>
            <TabsTrigger value="desafios">
              <Flame className="w-4 h-4 mr-2" />
              Desafios
            </TabsTrigger>
            <TabsTrigger value="oracoes">
              <Music className="w-4 h-4 mr-2" />
              Orações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderacao" className="mt-6">
            <ModerationManager />
          </TabsContent>

          <TabsContent value="contas" className="mt-6">
            <AccountsManager />
          </TabsContent>

          <TabsContent value="logins" className="mt-6">
            <LoginMonitor />
          </TabsContent>

          <TabsContent value="comunidade" className="mt-6">
            <CommunityModeration />
          </TabsContent>

          <TabsContent value="devocionais" className="mt-6">
            <DevotionalManager />
          </TabsContent>

          <TabsContent value="desafios" className="mt-6">
            <ChallengeManager />
          </TabsContent>

          <TabsContent value="oracoes" className="mt-6">
            <PrayerManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
