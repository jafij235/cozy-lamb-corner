import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, Home as HomeIcon, Users, Flame, LogOut } from "lucide-react";

const Home = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-6 h-6" />
            <span className="font-semibold text-lg">Jornada Espiritual</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Olá! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo à sua jornada de fé
          </p>
        </div>

        <Tabs defaultValue="oracoes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="oracoes">
              <Heart className="w-4 h-4 mr-2" />
              Orações
            </TabsTrigger>
            <TabsTrigger value="familia">
              <Users className="w-4 h-4 mr-2" />
              Família
            </TabsTrigger>
            <TabsTrigger value="devocional">
              <BookOpen className="w-4 h-4 mr-2" />
              Devocional
            </TabsTrigger>
            <TabsTrigger value="desafios">
              <Flame className="w-4 h-4 mr-2" />
              Desafios
            </TabsTrigger>
            <TabsTrigger value="comunidade">
              <HomeIcon className="w-4 h-4 mr-2" />
              Comunidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oracoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Orações Individuais</CardTitle>
                <CardDescription>
                  Momentos de conexão com Deus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Em breve você encontrará orações especiais aqui! 🙏
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="familia" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Orações em Família</CardTitle>
                <CardDescription>
                  Fortaleça os laços familiares com Deus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Em breve você encontrará orações em família aqui! 👨‍👩‍👦
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devocional" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Plano Devocional</CardTitle>
                <CardDescription>
                  Crescendo na fé dia a dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Em breve você terá acesso ao plano devocional! 📖
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="desafios" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Desafios Diários</CardTitle>
                <CardDescription>
                  Pequenas ações, grande impacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Em breve você terá desafios diários aqui! 🔥
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comunidade" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Comunidade de Oração</CardTitle>
                <CardDescription>
                  Compartilhe e ore pelos pedidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Em breve você poderá compartilhar pedidos de oração! 🤝
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Home;
