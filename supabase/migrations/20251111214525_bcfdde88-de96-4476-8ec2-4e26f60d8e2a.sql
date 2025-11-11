-- Create devotionals table
CREATE TABLE public.devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active devotionals"
  ON public.devotionals
  FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage devotionals"
  ON public.devotionals
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create challenges table
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON public.challenges
  FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage challenges"
  ON public.challenges
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create prayers table
CREATE TABLE public.prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  audio_url text NOT NULL,
  image_url text NOT NULL,
  type text NOT NULL CHECK (type IN ('individual', 'family')),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prayers"
  ON public.prayers
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage prayers"
  ON public.prayers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create prayer_requests table
CREATE TABLE public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL CHECK (length(content) <= 700),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prayer requests"
  ON public.prayer_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create prayer requests"
  ON public.prayer_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can delete prayer requests"
  ON public.prayer_requests
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create interactions table
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid REFERENCES public.prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('pray', 'support', 'peace', 'strength')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(prayer_request_id, user_id, type)
);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interactions"
  ON public.interactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can add interactions"
  ON public.interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid REFERENCES public.prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view reports"
  ON public.reports
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can delete reports"
  ON public.reports
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for prayer audios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prayer-audios', 'prayer-audios', true);

-- Create storage bucket for prayer images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prayer-images', 'prayer-images', true);

-- Storage policies for prayer audios
CREATE POLICY "Anyone can view prayer audios"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'prayer-audios');

CREATE POLICY "Only admins can upload prayer audios"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'prayer-audios' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete prayer audios"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'prayer-audios' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for prayer images
CREATE POLICY "Anyone can view prayer images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'prayer-images');

CREATE POLICY "Only admins can upload prayer images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'prayer-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete prayer images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'prayer-images' AND public.has_role(auth.uid(), 'admin'));