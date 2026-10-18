import {createClient,type SupabaseClient} from "@supabase/supabase-js";

/**
 * The anon / publishable key is safe to expose in a browser only when database RLS is enabled.
 * Never put a service_role or secret key into NEXT_PUBLIC_ variables.
 */
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const cloudConfigured=Boolean(url&&key);
export const supabase:SupabaseClient|null=cloudConfigured?
 createClient(url!,key!,{
  auth:{
   autoRefreshToken:true,
   persistSession:true,
   detectSessionInUrl:true,
   storageKey:"yks-akademi-2027-auth-v1"
  }
 }):null;
export const PROGRESS_TABLE="study_progress";
