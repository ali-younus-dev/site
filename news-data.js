/* ============================================================================
   FOTILE PULSE — data file for /newsletter/
   This file is the page's "database". Everything on the Pulse page renders
   from here — edit this file (or let the auto-curator update it) and the page
   updates instantly. Paths are relative to site root (joined with __PBASE).
   ========================================================================== */
window.FOTILE_NEWS = {

  /* ---- AUTO-CURATED FACT (the self-updating slot) ---- */
  fact: {
    tag: "Did you know?",
    text: "The compressor inside the new FOTILE F20 comes from Jiaxipera — the same supplier trusted for the cooling systems in Ferrari's in-car refrigerators.",
    source: "Curated by Fotile Intelligence",
    date: "August 2026"
  },

  /* ---- FILMS (custom player playlist) ---- */
  videos: [
    { title:"The Kitchen Showcase", sub:"Brand film · 2026", src:"assets/video/home-banner.mp4",    poster:"assets/video/home-banner-poster.jpg" },
    { title:"The Appliance Lineup", sub:"Product film",      src:"assets/video/product-banner.mp4", poster:"assets/video/product-banner-poster.jpg" },
    { title:"Moon Series · Cosmos", sub:"Premium collection", src:"assets/video/moon-banner.mp4",   poster:"assets/video/moon-banner-poster.jpg" },
    { title:"Achievements & Craft", sub:"Company story",     src:"assets/video/fotile-hero.mp4",    poster:"" }
  ],

  /* ---- LATEST UPDATES (timeline) ---- */
  updates: [
    { date:"Aug 2026", tag:"Launch",    title:"FOTILE F20 refrigerator unveiled",
      text:"Our first fully-embedded refrigerator — Berlin-designed, press-to-open, nitrogen fresh-keeping — presented at Fotile HQ. Pakistan pre-orders open soon." },
    { date:"Aug 2026", tag:"Offers",    title:"Seasonal sale goes live",
      text:"Up to 30% off across selected range hoods, ovens, hobs and dishwashers — marked with the red sale badge across the store." },
    { date:"Jul 2026", tag:"Digital",   title:"fotilepk.com 2.0",
      text:"A complete cinematic redesign of our website — faster, darker, more beautiful, with live product films on every major page." },
    { date:"Jul 2026", tag:"Product",   title:"Moon Series in the spotlight",
      text:"Our most premium collection gets its own cosmic showcase — obsidian glass, rose-gold detailing, celestial design." },
    { date:"Jun 2026", tag:"Community", title:"Dealer summit — Lahore",
      text:"40+ partners from across Pakistan joined us to preview the second half of 2026, including an exclusive first look at the F20." },
    { date:"Jun 2026", tag:"Service",   title:"Nationwide service week",
      text:"Free range-hood health checks and filter cleaning for registered customers in Lahore, Karachi and Islamabad." }
  ],

  /* ---- UPCOMING EVENTS ---- */
  events: [
    { d:"12", m:"SEP", title:"F20 Preview Night", place:"Fotile Flagship Store · Lahore",
      text:"Be among the first in Pakistan to press-to-open the F20. Invite-only evening with live demos." },
    { d:"26", m:"SEP", title:"Live Cooking Masterclass", place:"Emporium Mall · Lahore",
      text:"Guest chefs cook on Fotile hobs and ovens — watch the smoke vanish into a 9035 hood in real time." },
    { d:"10", m:"OCT", title:"Kitchen Design Expo", place:"Expo Centre · Karachi",
      text:"Fotile's full 2026 lineup on one floor — with exclusive expo-only bundle pricing." }
  ]
};
