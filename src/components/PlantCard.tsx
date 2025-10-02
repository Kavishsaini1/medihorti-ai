import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plant {
  id: string;
  name: string;
  scientific_name: string;
  category: string;
  description: string;
  medical_uses: string[];
  active_compounds: string[];
  image_url: string;
  ai_insights?: string;
}

interface PlantCardProps {
  plant: Plant;
  isFavorited?: boolean;
  onFavoriteChange?: () => void;
  onAnalyze?: (plant: Plant) => void;
}

const PlantCard = ({ plant, isFavorited = false, onFavoriteChange, onAnalyze }: PlantCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFavorite = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to save favorites.",
        });
        return;
      }

      if (isFavorited) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", session.user.id)
          .eq("plant_id", plant.id);

        if (error) throw error;
        toast({ title: "Removed from favorites" });
      } else {
        const { error } = await supabase
          .from("user_favorites")
          .insert({ user_id: session.user.id, plant_id: plant.id });

        if (error) throw error;
        toast({ title: "Added to favorites" });
      }

      onFavoriteChange?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-gradient-card border-border/50">
      <div className="relative h-48 overflow-hidden">
        <img
          src={plant.image_url}
          alt={plant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Button
            size="icon"
            variant="glass"
            onClick={handleFavorite}
            disabled={loading}
            className="rounded-full"
          >
            <Heart
              className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
        </div>
        <Badge className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm">
          {plant.category}
        </Badge>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{plant.name}</h3>
          <p className="text-sm text-muted-foreground italic">{plant.scientific_name}</p>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-2">{plant.description}</p>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Medical Uses:</p>
          <div className="flex flex-wrap gap-1">
            {plant.medical_uses.slice(0, 3).map((use, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {use}
              </Badge>
            ))}
          </div>
        </div>

        {onAnalyze && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onAnalyze(plant)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Analysis
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PlantCard;
