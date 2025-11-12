import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DevotionalPlan = () => {
  const [selectedDevotional, setSelectedDevotional] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const { data: devotionals = [] } = useQuery({
    queryKey: ["devotionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .eq("active", true)
        .order("order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleOpen = (devotional: any) => {
    setSelectedDevotional(devotional);
    setOpen(true);
  };

  const handleMarkComplete = () => {
    toast.success("Devocional marcado como concluído! 🙏", {
      description: "Continue sua jornada espiritual amanhã",
    });
    setOpen(false);
  };

  if (devotionals.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Nenhum devocional disponível no momento
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {devotionals.map((devotional) => (
          <Card
            key={devotional.id}
            className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
            onClick={() => handleOpen(devotional)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <BookOpen className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{devotional.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {devotional.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedDevotional?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {selectedDevotional?.content}
              </p>
            </div>
            <Button
              onClick={handleMarkComplete}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Marcar como Concluído Hoje
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
