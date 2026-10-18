-- YKS Akademi: her kullanıcı yalnızca kendi çalışma kayıtlarını görür.
-- Supabase Dashboard > SQL Editor bölümünde bir kez çalıştırın.
create table if not exists public.study_progress (
    user_id uuid primary key references auth.users (id) on delete cascade,
    payload jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);
create index if not exists study_progress_updated_idx on public.study_progress (updated_at desc);
alter table public.study_progress enable row level security;
revoke all on public.study_progress from anon;
grant select, insert, update, delete on public.study_progress to authenticated;
drop policy if exists "Read own study record" on public.study_progress;
drop policy if exists "Insert own study record" on public.study_progress;
drop policy if exists "Update own study record" on public.study_progress;
drop policy if exists "Delete own study record" on public.study_progress;
create policy "Read own study record" on public.study_progress
 for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own study record" on public.study_progress
 for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own study record" on public.study_progress
 for update to authenticated using ((select auth.uid())=user_id)
 with check ((select auth.uid())=user_id);
create policy "Delete own study record" on public.study_progress
 for delete to authenticated using ((select auth.uid())=user_id);
comment on table public.study_progress is 'Per-user YKS study history and unfinished quizzes, protected by user_id RLS';
