import { createClient } from "@supabase/supabase-js";

// 🔗 Your Supabase Project URL
const supabaseUrl = "https://baxunszartvmsnqyszug.supabase.co";

// 🔑 Your Publishable (anon) key
const supabaseKey = "sb_publishable_1n73qvUxq5LzmOJ2BMoV4Q__iT_1ocD";

// 🚀 Create client
export const supabase = createClient(supabaseUrl, supabaseKey);