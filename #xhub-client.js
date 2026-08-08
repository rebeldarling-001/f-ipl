





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

/* =========================================================================
   AUCTION HELPERS — used by auction-center.html, auction-viewer.html,
   auction-captain.html, auction-admin.html. Requires xhub-auction-schema.sql
   to have been run (tables xauc_state, xauc_lots, xauc_bids, xauc_passes,
   xauc_franchise_meta + the xauc_verify_captain/xauc_place_bid/xauc_pass_lot
   functions).
   ========================================================================= */

/* ---------- Format a Crore amount for display, e.g. 1.5 -> "1.5 Cr" ---------- */
function xaucFormatCr(amount) {
    const n = Number(amount || 0);
    const rounded = Math.round(n * 100) / 100;
    const str = Number.isInteger(rounded)
        ? String(rounded)
        : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return `${str} Cr`;
}

/* ---------- The single "what's happening right now" row ---------- */
async function xaucGetState() {
    const { data, error } = await xhub.from('xauc_state').select('*').eq('id', 1).single();
    if (error) {
        console.error('[XAUC] xaucGetState error:', error);
        return null;
    }
    return data;
}

/* ---------- A lot joined with its player's registration details ---------- */
async function xaucGetLotWithPlayer(lotId) {
    if (!lotId) return null;
    const { data, error } = await xhub
        .from('xauc_lots')
        .select('*, xhub_players(*)')
        .eq('id', lotId)
        .single();
    if (error) {
        console.error('[XAUC] xaucGetLotWithPlayer error:', error);
        return null;
    }
    return data;
}

/* ---------- Just the franchise name for whoever is currently leading the bid ---------- */
async function xaucGetLeadingFranchiseName(franchiseId) {
    if (!franchiseId) return null;
    const { data, error } = await xhub
        .from('xhub_franchises')
        .select('franchise_name')
        .eq('id', franchiseId)
        .single();
    if (error) {
        console.error('[XAUC] xaucGetLeadingFranchiseName error:', error);
        return null;
    }
    return data;
}

/* ---------- Live presence: who's in the room right now, by role ----------
   role: 'viewer' | 'captain' | 'admin'
   onCounts receives { viewer: N, captain: N, admin: N } every time anyone
   joins or leaves — this is what drives the live "X watching" counters. */
let xaucPresenceChannel = null;
function xaucJoinPresence(role, name, onCounts) {
    try {
        const presenceKey = `${role}-${Math.random().toString(36).slice(2, 10)}`;
        xaucPresenceChannel = xhub.channel('xauc-room', {
            config: { presence: { key: presenceKey } }
        });
        xaucPresenceChannel.on('presence', { event: 'sync' }, () => {
            const state = xaucPresenceChannel.presenceState();
            const counts = { viewer: 0, captain: 0, admin: 0 };
            Object.values(state).forEach((presences) => {
                presences.forEach((p) => {
                    if (counts[p.role] !== undefined) counts[p.role]++;
                });
            });
            onCounts(counts);
        });
        xaucPresenceChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await xaucPresenceChannel.track({ role, name, online_at: new Date().toISOString() });
            }
        });
    } catch (err) {
        console.error('[XAUC] presence error:', err);
    }
}

/* ---------- Live table changes: fires onChange() with zero args any time
   the state/lots/bids/passes tables change — no page refresh needed. ---------- */
let xaucRealtimeChannel = null;
function xaucSubscribeRealtime(onChange) {
    try {
        xaucRealtimeChannel = xhub
            .channel('xauc-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'xauc_state' }, onChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'xauc_lots' }, onChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'xauc_bids' }, onChange)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'xauc_passes' }, onChange)
            .subscribe();
    } catch (err) {
        console.error('[XAUC] realtime subscribe error:', err);
    }
}