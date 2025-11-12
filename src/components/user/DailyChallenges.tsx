import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DailyChallenges = () => {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

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

  const handleToggle = (challengeId: string, checked: boolean) => {
    const newCompleted = new Set(completed);
    if (checked) {
      newCompleted.add(challengeId);
      toast.success("Desafio concluído! 🎉", {
        description: "Continue firme na sua jornada!",
      });
    } else {
      newCompleted.delete(challengeId);
    }
    setCompleted(newCompleted);
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
        const isCompleted = completed.has(challenge.id);
        return (
          <Card
            key={challenge.id}
            className={`transition-all ${
              isCompleted ? "bg-primary/5 border-primary/30" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={challenge.id}
                  checked={isCompleted}
                  onCheckedChange={(checked) =>
                    handleToggle(challenge.id, checked as boolean)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor={challenge.id}
                  className="flex-1 cursor-pointer"
                >
                  <h4
                    className={`font-semibold mb-1 ${
                      isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {challenge.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      isCompleted ? "text-muted-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {challenge.description}
                  </p>
                </label>
                {isCompleted && (
                  <Flame className="w-5 h-5 text-primary animate-pulse" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
