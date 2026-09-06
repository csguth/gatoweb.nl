// Pure helpers (issue #173 follow-up) for the standalone Clients page
// (js/facturen/clients-app.js + layouts/facturen/clients/list.html): status
// derivation, search matching, sorting and pagination for the client roster.
//
// No i18n/DOM/Alpine/Supabase here on purpose — keeping it pure makes it easy
// to verify independently of the page (see tests/bdd/features/client-list.feature).

// A client's invite lifecycle, derived straight from the two timestamp
// columns in public.clients (schema.sql) — never stored redundantly.
export function clientStatus(client) {
  if (client.accepted_at) return 'accepted';
  if (client.invited_at) return 'invited';
  return 'pending';
}

export function matchesClientSearch(client, term) {
  if (!term) return true;
  const haystack = [client.name, client.email, client.phone]
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
  email: (c) => (c.email || '').toLowerCase(),
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
