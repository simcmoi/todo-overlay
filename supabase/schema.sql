-- Todo Overlay - Supabase Database Schema
-- This file should be executed in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new

-- =============================================================================
-- TABLES
-- =============================================================================

-- Table: lists
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT,
  device_id TEXT,
  version INTEGER DEFAULT 1
);

-- Table: labels
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('slate', 'blue', 'green', 'amber', 'rose', 'violet')),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT,
  device_id TEXT,
  version INTEGER DEFAULT 1
);

-- Table: todos
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT,
  parent_id UUID REFERENCES public.todos(id) ON DELETE CASCADE,
  list_id UUID REFERENCES public.lists(id) ON DELETE SET NULL,
  starred BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high', 'urgent')),
  label_id UUID REFERENCES public.labels(id) ON DELETE SET NULL,
  sort_index INTEGER,
  created_at BIGINT NOT NULL,
  completed_at BIGINT,
  reminder_at BIGINT,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT,
  device_id TEXT,
  version INTEGER DEFAULT 1
);

-- Table: user_settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode TEXT DEFAULT 'system',
  auto_close_on_blur BOOLEAN DEFAULT TRUE,
  enable_autostart BOOLEAN DEFAULT TRUE,
  global_shortcut TEXT DEFAULT 'Shift+Space',
  sort_mode TEXT DEFAULT 'recent',
  sort_order TEXT DEFAULT 'desc',
  active_list_id UUID,
  updated_at BIGINT NOT NULL,
  device_id TEXT,
  version INTEGER DEFAULT 1
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Lists indexes
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_updated_at ON public.lists(updated_at);
CREATE INDEX IF NOT EXISTS idx_lists_deleted_at ON public.lists(deleted_at) WHERE deleted_at IS NULL;

-- Labels indexes
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON public.labels(user_id);
CREATE INDEX IF NOT EXISTS idx_labels_updated_at ON public.labels(updated_at);
CREATE INDEX IF NOT EXISTS idx_labels_deleted_at ON public.labels(deleted_at) WHERE deleted_at IS NULL;

-- Todos indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON public.todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON public.todos(parent_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_updated_at ON public.todos(updated_at);
CREATE INDEX IF NOT EXISTS idx_todos_deleted_at ON public.todos(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todos_completed_at ON public.todos(completed_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES: lists
-- =============================================================================

CREATE POLICY "Users can view their own lists"
  ON public.lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES: labels
-- =============================================================================

CREATE POLICY "Users can view their own labels"
  ON public.labels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own labels"
  ON public.labels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labels"
  ON public.labels FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own labels"
  ON public.labels FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES: todos
-- =============================================================================

CREATE POLICY "Users can view their own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES: user_settings
-- =============================================================================

CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- REALTIME
-- =============================================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.labels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
