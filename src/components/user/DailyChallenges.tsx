import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompletions } from "@/hooks/useCompletions";

export const DailyChallenges = () => {
  const { isCompleted, markComplete } = useCompletions();

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
      await markComplete(challengeId, 'challenge');
    }
  };

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <Flame className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Nenhum desafio disponível no momento
        </p>
      </div>
    );
  }

  return (
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
                  <Flame className="w-5 h-5 text-primary animate-pulse flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
