-- 一步一步學習韓文：每個帳號一列學習紀錄
-- 跟日文網站共用同一個 Supabase 專案（同一組帳號），進度分開存在這張表
create table if not exists public.korean_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 只能讀寫自己的紀錄
alter table public.korean_progress enable row level security;

create policy "讀取自己的韓文進度" on public.korean_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "新增自己的韓文進度" on public.korean_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "更新自己的韓文進度" on public.korean_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
