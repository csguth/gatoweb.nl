// Pure helper shared by account-app.js and clients-app.js: renders a
// booking's or a client Profile's `pets` jsonb array (issue #179 gave
// Profiles their own pets, same shape as bookings.pets) as a short summary
// string, e.g. "Mimi (cat), Rex (dog)".
export function petsSummary(pets) {
  if (!Array.isArray(pets) || pets.length === 0) return '-';
  return pets.map(p => (p.name ? p.name + ' (' + (p.otherType || p.type) + ')' : (p.otherType || p.type))).join(', ');
}
