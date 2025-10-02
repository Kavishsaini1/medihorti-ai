-- Create enum for plant categories
CREATE TYPE plant_category AS ENUM ('medicinal', 'therapeutic', 'research', 'cultivation');

-- Create medicinal plants table
CREATE TABLE public.medicinal_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  category plant_category NOT NULL,
  description TEXT,
  medical_uses TEXT[],
  active_compounds TEXT[],
  image_url TEXT,
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medicinal_plants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view plants"
  ON public.medicinal_plants
  FOR SELECT
  USING (true);

-- Create user_favorites table
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.medicinal_plants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plant_id)
);

-- Enable RLS for favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.user_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON public.user_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create user roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies for managing plants (admin only)
CREATE POLICY "Admins can insert plants"
  ON public.medicinal_plants
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plants"
  ON public.medicinal_plants
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plants"
  ON public.medicinal_plants
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON public.medicinal_plants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample plants
INSERT INTO public.medicinal_plants (name, scientific_name, category, description, medical_uses, active_compounds, image_url) VALUES
('Aloe Vera', 'Aloe barbadensis miller', 'medicinal', 'Succulent plant species known for its therapeutic properties', ARRAY['Wound healing', 'Skin conditions', 'Digestive health'], ARRAY['Polysaccharides', 'Anthraquinones', 'Vitamins'], 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800'),
('Lavender', 'Lavandula angustifolia', 'therapeutic', 'Aromatic plant used for relaxation and stress relief', ARRAY['Anxiety relief', 'Sleep improvement', 'Pain management'], ARRAY['Linalool', 'Linalyl acetate'], 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800'),
('Turmeric', 'Curcuma longa', 'medicinal', 'Root plant with powerful anti-inflammatory properties', ARRAY['Anti-inflammatory', 'Antioxidant', 'Joint health'], ARRAY['Curcumin', 'Turmerones'], 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800'),
('Ginger', 'Zingiber officinale', 'medicinal', 'Root commonly used for digestive and anti-nausea benefits', ARRAY['Nausea relief', 'Digestive aid', 'Anti-inflammatory'], ARRAY['Gingerol', 'Shogaol'], 'https://images.unsplash.com/photo-1599909533925-dc06b2b68430?w=800'),
('Chamomile', 'Matricaria chamomilla', 'therapeutic', 'Flowering plant known for calming properties', ARRAY['Sleep aid', 'Digestive health', 'Anti-inflammatory'], ARRAY['Apigenin', 'Bisabolol'], 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800');