import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlantCard from "./PlantCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
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

const PlantsGrid = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlants();
    loadFavorites();
  }, []);

  const loadPlants = async () => {
    try {
      const { data, error } = await supabase
        .from("medicinal_plants")
        .select("*")
        .order("name");

      if (error) throw error;
      setPlants(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load plants",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("user_favorites")
      .select("plant_id")
      .eq("user_id", session.user.id);

    if (data) {
      setFavorites(new Set(data.map((f) => f.plant_id)));
    }
  };

  const handleAnalyze = async (plant: Plant) => {
    setSelectedPlant(plant);
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-plant", {
        body: {
          plantName: plant.name,
          scientificName: plant.scientific_name,
          description: plant.description,
          medicalUses: plant.medical_uses,
        },
      });

      if (error) throw error;

      if (data?.insights) {
        setSelectedPlant({ ...plant, ai_insights: data.insights });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze plant",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <section id="plants-section" className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Medicinal Plant Database
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore our comprehensive collection of therapeutic plants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                isFavorited={favorites.has(plant.id)}
                onFavoriteChange={loadFavorites}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedPlant} onOpenChange={() => setSelectedPlant(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPlant?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground italic">
              {selectedPlant?.scientific_name}
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <img
              src={selectedPlant?.image_url}
              alt={selectedPlant?.name}
              className="w-full h-64 object-cover rounded-lg"
            />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{selectedPlant?.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Medical Uses</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {selectedPlant?.medical_uses.map((use, idx) => (
                  <li key={idx}>{use}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Active Compounds</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPlant?.active_compounds.map((compound, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    {compound}
                  </span>
                ))}
              </div>
            </div>

            {analyzing ? (
              <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
                <p className="text-sm">Generating AI insights...</p>
              </div>
            ) : selectedPlant?.ai_insights ? (
              <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">AI-Generated Insights</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedPlant.ai_insights}
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlantsGrid;
