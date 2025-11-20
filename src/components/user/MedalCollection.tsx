import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompletions, MEDALS } from "@/hooks/useCompletions";
import { Badge } from "@/components/ui/badge";

export const MedalCollection = () => {
  const { medals, displayMedal, setMedalToDisplay, totalCompletions, loading, customMedals } = useCompletions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sua Coleção de Medalhas</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sua Coleção de Medalhas</CardTitle>
        <CardDescription>
          Total de conclusões: {totalCompletions} | Próxima medalha em: {10 - (totalCompletions % 10)} conclusões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {MEDALS.map((medal) => {
            const earned = medals.includes(medal.tier);
            const isDisplayed = displayMedal === medal.tier;
            
            return (
              <div
                key={medal.tier}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  earned
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/50 border-muted opacity-50'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className={`text-4xl ${earned ? '' : 'grayscale'}`}>
                    {medal.icon}
                  </div>
                  <div className="font-semibold text-sm">{medal.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {medal.requiredCompletions} conclusões
                  </div>
                  {earned && (
                    <Button
                      size="sm"
                      variant={isDisplayed ? "default" : "outline"}
                      onClick={() => setMedalToDisplay(isDisplayed ? null : medal.tier)}
                      className="w-full text-xs"
                    >
                      {isDisplayed ? 'Exibindo' : 'Exibir'}
                    </Button>
                  )}
                  {earned && (
                    <Badge variant="secondary" className="w-full justify-center text-xs">
                      Conquistada
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}

          {/* Medalhas Personalizadas */}
          {customMedals?.map((medal) => {
            const isDisplayed = displayMedal === medal.id;
            
            return (
              <div
                key={medal.id}
                className="relative p-4 rounded-lg border-2 transition-all bg-primary/10 border-primary"
              >
                <div className="text-center space-y-2">
                  <div className="text-4xl">{medal.custom_icon}</div>
                  <div className="font-semibold text-sm">{medal.custom_name}</div>
                  <div className="text-xs text-muted-foreground">Especial</div>
                  <Button
                    size="sm"
                    variant={isDisplayed ? "default" : "outline"}
                    onClick={() => setMedalToDisplay(isDisplayed ? null : medal.id)}
                    className="w-full text-xs"
                  >
                    {isDisplayed ? 'Exibindo' : 'Exibir'}
                  </Button>
                  <Badge variant="secondary" className="w-full justify-center text-xs">
                    Conquistada
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
