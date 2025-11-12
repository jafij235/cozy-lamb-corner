import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PrayerListProps {
  type: "individual" | "family";
}

export const PrayerList = ({ type }: PrayerListProps) => {
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  const { data: prayers = [] } = useQuery({
    queryKey: ["prayers", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prayers")
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handlePlayPause = (prayerId: string, audioUrl: string) => {
    if (currentPrayer === prayerId && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (currentPrayer !== prayerId) {
        audio.src = audioUrl;
        setCurrentPrayer(prayerId);
      }
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSkip = (seconds: number) => {
    audio.currentTime += seconds;
  };

  if (prayers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhuma oração disponível no momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prayers.map((prayer) => (
        <Card key={prayer.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              <img
                src={prayer.image_url}
                alt={prayer.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{prayer.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {prayer.description}
                </p>
                {currentPrayer === prayer.id ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSkip(-10)}
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePlayPause(prayer.id, prayer.audio_url)}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSkip(10)}
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handlePlayPause(prayer.id, prayer.audio_url)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Ouvir Oração
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
