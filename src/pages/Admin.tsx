import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BookOpen, Flame, Music, Flag, LogOut } from "lucide-react";

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="moderacao">
              <Flag className="w-4 h-4 mr-2" />
              Moderação
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
            <Card>
              <CardHeader>
                <CardTitle>Moderação de Comentários</CardTitle>
                <CardDescription>
                  Gerencie denúncias e comentários reportados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma denúncia pendente no momento
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devocionais" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Devocionais</CardTitle>
                    <CardDescription>
                      Adicione, edite ou desative devocionais
                    </CardDescription>
                  </div>
                  <Button>
                    Adicionar Devocional
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum devocional cadastrado ainda
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="desafios" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Desafios</CardTitle>
                    <CardDescription>
                      Adicione, edite ou desative desafios diários
                    </CardDescription>
                  </div>
                  <Button>
                    Adicionar Desafio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum desafio cadastrado ainda
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="oracoes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Orações</CardTitle>
                    <CardDescription>
                      Adicione, edite ou remova orações (individuais e em família)
                    </CardDescription>
                  </div>
                  <Button>
                    Adicionar Oração
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma oração cadastrada ainda
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
