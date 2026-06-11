-- =====================================================================
-- AUTOMATED VIDEO FACTORY - CORE DATABASE SCHEMA
-- Target Platform: Supabase (PostgreSQL)
-- Version: 2.0.0 (Global & Neutral Edition)
-- =====================================================================

-- 1. Drop the table if it already exists to ensure a clean deployment
DROP TABLE IF EXISTS public.videos_queue;

-- 2. Create the master video queue table
CREATE TABLE public.videos_queue (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Queue Input Parameters
    topic TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('story_wisdom', 'story_craft', 'dual_video', 'promo', 'advice')),
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    video_theme_color TEXT DEFAULT '#FFD700' NOT NULL,
    
    -- AI Generated Content Assets
    title TEXT,
    voiceover_ar TEXT,
    audio_url TEXT,
    
    -- Render & Composition Context Mapping
    video_url TEXT,
    video_urls TEXT[] DEFAULT '{}'::TEXT[],
    main_video_url TEXT,
    satisfying_urls TEXT[] DEFAULT '{}'::TEXT[],
    
    -- Timing & Framework Variables
    duration_in_frames INT4 DEFAULT 900,
    audio_duration_frames INT4,
    cta_start INT4 DEFAULT -1,
    cta_end INT4 DEFAULT -1,
    
    -- Maintenance & Logging Systems
    error_message TEXT,
    published_url TEXT
);

-- 3. Enable Row Level Security (RLS) for data protection
ALTER TABLE public.videos_queue ENABLE ROW LEVEL SECURITY;

-- 4. Create universal non-restrictive policies for n8n server connection
CREATE POLICY "Allow anonymous select access" ON public.videos_queue FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.videos_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.videos_queue FOR UPDATE USING (true);

-- 5. Inject optimization indexes for ultra-fast n8n polling cycles
CREATE INDEX idx_videos_queue_status_category ON public.videos_queue (status, category);

-- =====================================================================
-- END OF SCHEMA FILE
-- =====================================================================