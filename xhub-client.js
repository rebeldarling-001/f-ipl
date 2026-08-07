/* =========================================================================
   FREEFIRE XIPL — REGISTRATION HUB — SHARED SUPABASE CLIENT
   =========================================================================
   Included via CDN script tag BEFORE this file on every hub page:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="xhub-client.js"></script>

   Fill in the same project URL + anon key you already use for teams.html /
   your admin panel — this is the SAME Supabase project, just new tables.
   ========================================================================= */

const XHUB_SUPABASE_URL = 'https://ndioutmihxodqknvgfju.supabase.co';
const XHUB_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kaW91dG1paHhvZHFrbnZnZmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTg2NDMsImV4cCI6MjA5ODYzNDY0M30.KeSyXI6DFvYnKbBxICmrmQ8t8eFIoxPn9Ln1aBU0OUk';

const xhub = window.supabase.createClient(XHUB_SUPABASE_URL, XHUB_SUPABASE_ANON_KEY);

/* ---------- Settings (open/close toggles) ---------- */
async function xhubGetSettings() {
    const { data, error } = await xhub
        .from('xhub_settings')
        .select('players_open, franchises_open')
        .eq('id', 1)
        .single();
    if (error) {
        console.error('xhubGetSettings error:', error);
        // fail open so a settings-fetch hiccup never silently locks everyone out
        return { players_open: true, franchises_open: true };
    }
    return data;
}

/* ---------- File upload helper — returns a public URL ---------- */
async function xhubUploadFile(bucket, file, prefix) {
    const ext = file.name.split('.').pop();
    const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await xhub.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = xhub.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/* ---------- Small util ---------- */
function xhubEscape(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
}