import { Button } from "@/components/ui/button";
import { Leaf, Sparkles, Users } from "lucide-react";

const Hero = () => {
  const scrollToPlants = () => {
    document.getElementById("plants-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJjMCAwLTItMiAyIDJoMnYyYzAgMC0yLTIgMiAyaC0ybS0yIDBoLTJ2LTJjMCAwIDIgMi0yLTJoLTJ2LTJjMCAwIDIgMi0yLTJoMnYtMmMyIDAgMCAyIDIgMHYyaDJjMCAwLTIgMi0yIDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by Advanced AI Technology</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Medical Horticulture
            </span>
            <br />
            <span className="text-foreground">Meets AI Innovation</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the therapeutic power of plants with AI-driven insights, research-backed data, 
            and personalized horticultural guidance for medical applications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              variant="hero"
              onClick={scrollToPlants}
              className="text-lg px-8"
            >
              <Leaf className="mr-2 h-5 w-5" />
              Explore Plants
            </Button>
            <Button
              size="lg"
              variant="glass"
              onClick={() => document.getElementById("ai-consultant")?.scrollIntoView({ behavior: "smooth" })}
              className="text-lg px-8"
            >
              <Users className="mr-2 h-5 w-5" />
              AI Consultant
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              {
                icon: Leaf,
                title: "500+ Medicinal Plants",
                description: "Comprehensive database of therapeutic species"
              },
              {
                icon: Sparkles,
                title: "AI-Powered Analysis",
                description: "Advanced insights from machine learning"
              },
              {
                icon: Users,
                title: "Expert Guidance",
                description: "Professional horticultural consultation"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-gradient-card backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
