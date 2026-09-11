// Pure helpers (issue #173 follow-up) for the standalone Clients page
// (js/facturen/clients-app.js + layouts/clients/list.html): status
// derivation, search matching, sorting and pagination for the client roster.
//
// No i18n/DOM/Alpine/Supabase here on purpose — keeping it pure makes it easy
// to verify independently of the page (see tests/bdd/features/client-list.feature).

// A client's invite lifecycle (issue #179), derived from the separate
// client_invites/account_profile_links rows fetched for it — Profile itself
// (public.clients) no longer carries invited_at/accepted_at columns; see
// deriveClientRoster() below, which annotates each client with those two
// timestamps so the rest of this module (and the existing UI) keeps working
// unchanged.
export function clientStatus(client) {
  if (client.accepted_at) return 'accepted';
  if (client.invited_at) return 'invited';
  return 'pending';
}

// Merges raw `clients` rows with their `client_invites` and
// `account_profile_links` rows (as loaded separately by clients-app.js) into
// the { ...client, invited_at, accepted_at } shape the rest of this module
// (and the roster table) expects. `invited_at` is the most recent invite
// issued for that client (regardless of whether it was used/expired — it
// only means "an invite link exists"); `accepted_at` is when the linked
// Account was created, if any.
export function deriveClientRoster(clients, invites, links) {
  const latestInviteByClient = new Map();
  for (const invite of invites || []) {
    const current = latestInviteByClient.get(invite.client_id);
    if (!current || new Date(invite.created_at) > new Date(current)) {
      latestInviteByClient.set(invite.client_id, invite.created_at);
    }
  }
  const linkByClient = new Map((links || []).map((l) => [l.client_id, l.linked_at]));

  return (clients || []).map((c) => ({
    ...c,
    invited_at: latestInviteByClient.get(c.id) || null,
    accepted_at: linkByClient.get(c.id) || null
  }));
}

// Issue #179: a Profile no longer has an email (that lives on the linked
// Account instead, which this pure module never sees) — search matches name
// and phone only.
export function matchesClientSearch(client, term) {
  if (!term) return true;
  const haystack = [client.name, client.phone]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

// Combines the free-text search with the status dropdown filter
// ('all' | 'pending' | 'invited' | 'accepted').
export function filterClients(clients, { search, status } = {}) {
  return clients.filter((c) => {
    if (status && status !== 'all' && clientStatus(c) !== status) return false;
    return matchesClientSearch(c, search);
  });
}

const SORTABLE_FIELDS = {
  name: (c) => (c.name || '').toLowerCase(),
  status: (c) => clientStatus(c),
  created_at: (c) => new Date(c.created_at).getTime()
};

// field defaults to 'created_at' (newest first) so a freshly-registered
// client is easy to find without touching any column header first.
export function sortClients(clients, field = 'created_at', dir = 'desc') {
  const key = SORTABLE_FIELDS[field] ? field : 'created_at';
  const getValue = SORTABLE_FIELDS[key];
  const sign = dir === 'asc' ? 1 : -1;
  return clients.slice().sort((a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    if (va < vb) return -1 * sign;
    if (va > vb) return 1 * sign;
    return 0;
  });
}

// Slices an already filtered+sorted list into one page. `page` is clamped to
// a valid range so callers never have to guard against an out-of-bounds
// value left over from before a filter/search narrowed the results.
export function paginate(clients, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: clients.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalCount: clients.length
  };
}
