import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/useAchievements";
import { Trophy, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const AchievementDisplay = () => {
  const { achievements, userAchievements } = useAchievements();

  const isEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      devotion: "bg-primary/10 text-primary border-primary/30",
      community: "bg-secondary/10 text-secondary border-secondary/30",
    };
    return colors[category] || "bg-muted";
  };

  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card className="hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Conquistas
            </CardTitle>
            <Badge variant="secondary">
              {earnedCount}/{totalCount}
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const earned = isEarned(achievement.id);
          
          return (
            <Card
              key={achievement.id}
              className={`transition-all ${
                earned
                  ? "bg-primary/5 border-primary/30 border-2 hover-lift"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{earned ? achievement.icon : <Lock className="w-12 h-12 text-muted-foreground" />}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{achievement.name}</h3>
                      {earned && (
                        <Badge variant="default" className="text-xs">
                          Conquistado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <Badge
                      variant="outline"
                      className={getCategoryColor(achievement.category)}
                    >
                      {achievement.category === 'devotion' ? 'Devoção' : 'Comunidade'}
                    </Badge>
                  </div>
                </div>
                {earned && userAchievements.find(ua => ua.achievement_id === achievement.id) && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Conquistado em{" "}
                    {new Date(
                      userAchievements.find(ua => ua.achievement_id === achievement.id)!.earned_at
                    ).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
