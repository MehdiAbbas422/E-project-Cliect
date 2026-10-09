// Central place for the decorative page imagery. All photos are free-to-use
// Unsplash images (hot-linked) chosen to match the purpose of each page.
const u = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const pageImages = {
  // Events / discovery
  expos: u('1511578314322-379afb476865'),
  exhibitors: u('1556761175-b413da4baf72'),
  // Organizer & admin areas
  dashboard: u('1552664730-d307ca884978'),
  adminExhibitors: u('1591115765373-5207764f72e7'),
  adminFeedback: u('1553877522-43269d4ea984'),
  adminUsers: u('1522071820081-009f0129c71c'),
  exhibitorPortal: u('1531482615713-2afd69097998'),
  // Attendee areas
  feedback: u('1516321318423-f06f85e504b3'),
  myBookings: u('1501281668745-f7f57925c3b4'),
  myMessages: u('1587560699334-cc4ff634909a'),
  profile: u('1534528741775-53994a69daeb'),
  // Auth pages
  login: u('1540575467063-178a50c2df87'),
  register: u('1523580494863-6f3031224c94'),
  forgot: u('1554224155-6726b3ff858f'),
  // Home hero
  homeHero: u('1492684223066-81342ee5ff30', 1800)
}
