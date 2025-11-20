import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompletions } from "@/hooks/useCompletions";
import { useMedalAnimation } from "@/hooks/useMedalAnimation";
import { MedalAnimationOverlay } from "./MedalAnimationOverlay";

export const DailyChallenges = () => {
  const { isCompleted, markComplete } = useCompletions();
  const { showAnimation, medalInfo, triggerMedalAnimation, hideAnimation } = useMedalAnimation();

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("active", true)
        .order("order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleToggle = async (challengeId: string, checked: boolean) => {
    if (checked) {
      const result = await markComplete(challengeId, 'challenge');
      if (result.newMedal) {
        triggerMedalAnimation(result.newMedal.name, result.newMedal.icon);
      }
    }
  };

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl text-muted-foreground mb-4 block">✦</span>
        <p className="text-muted-foreground">
          Nenhum desafio disponível no momento
        </p>
      </div>
    );
  }

  return (
    <>
      <MedalAnimationOverlay
        show={showAnimation}
        medalName={medalInfo?.name || ''}
        medalIcon={medalInfo?.icon || ''}
        onComplete={hideAnimation}
      />
      <div className="space-y-3">
      {challenges.map((challenge) => {
        const challengeCompleted = isCompleted(challenge.id, 'challenge');
        
        return (
          <Card
            key={challenge.id}
            className={`transition-all ${
              challengeCompleted ? "bg-primary/5 border-primary/30 border-2" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={challenge.id}
                  checked={challengeCompleted}
                  onCheckedChange={(checked) =>
                    handleToggle(challenge.id, checked as boolean)
                  }
                  className="mt-1 flex-shrink-0"
                />
                <label
                  htmlFor={challenge.id}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <h4
                    className={`font-semibold mb-1 ${
                      challengeCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {challenge.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      challengeCompleted ? "text-muted-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {challenge.description}
                  </p>
                </label>
                {challengeCompleted && (
                  <span className="text-2xl text-primary animate-pulse flex-shrink-0">✦</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </>
  );
};
