import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import PlantsGrid from "@/components/PlantsGrid";
import AIConsultant from "@/components/AIConsultant";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <PlantsGrid />
      <AIConsultant />
      
      <footer className="bg-muted/30 py-8 px-4 border-t border-border/50">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 MediHort AI - Advancing Medical Horticulture Through Technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
