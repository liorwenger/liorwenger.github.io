// ─────────────────────────────────────────────────────────────────────────────
// Figma Plugin: Create Tamar Segura CV – new layout
//
// How to run:
//   1. In Figma desktop, open your CV file
//   2. Menu → Plugins → Development → New Plugin
//   3. Choose "Run once" → click "Create plugin" anywhere on disk
//   4. Open the generated code.js and REPLACE its contents with this file
//   5. Back in Figma: Plugins → Development → "your plugin" → Run
//   6. A new page called "CV – Tamar Segura" will be created
// ─────────────────────────────────────────────────────────────────────────────

(async function () {

// ── Helpers ──────────────────────────────────────────────────────────────────

function hex(h) {
  return {
    r: parseInt(h.slice(1, 3), 16) / 255,
    g: parseInt(h.slice(3, 5), 16) / 255,
    b: parseInt(h.slice(5, 7), 16) / 255,
  };
}

const C = {
  bar:     hex("#BACDD8"),
  name:    hex("#1A1F2E"),
  label:   hex("#8AAABB"),
  date:    hex("#6E9BAD"),
  body:    hex("#2D3142"),
  white:   hex("#FFFFFF"),
  guardz:  hex("#1FAF50"),
  rupert:  hex("#C75B3B"),
  similar: hex("#1C3A5F"),
  wix:     hex("#E07828"),
  coro:    hex("#2B7EB0"),
};

function solid(c) { return [{ type: "SOLID", color: c }]; }

// ── Font loading ──────────────────────────────────────────────────────────────

const FONT = "Inter";
await Promise.all([
  figma.loadFontAsync({ family: FONT, style: "Regular" }),
  figma.loadFontAsync({ family: FONT, style: "Italic" }),
  figma.loadFontAsync({ family: FONT, style: "Medium" }),
  figma.loadFontAsync({ family: FONT, style: "SemiBold" }),
  figma.loadFontAsync({ family: FONT, style: "Bold" }),
]);

// ── Layout constants ──────────────────────────────────────────────────────────

const PW        = 595;   // page width (A4 at 72dpi)
const PH        = 842;   // page height
const HPAD      = 48;    // horizontal page padding
const LABEL_W   = 136;   // left-column (section label) width
const COL_GAP   = 20;    // gap between columns
const ENTRY_W   = PW - HPAD * 2 - LABEL_W - COL_GAP;  // 343

// ── Text factory ─────────────────────────────────────────────────────────────

function text(chars, { size = 9, style = "Regular", color = C.body, width,
                       align = "LEFT", ls, lh, upper } = {}) {
  const t = figma.createText();
  t.fontName      = { family: FONT, style };
  t.characters    = chars;
  t.fontSize      = size;
  t.fills         = solid(color);
  t.textAlignHorizontal = align;
  if (ls) t.letterSpacing = { value: ls, unit: "PIXELS" };
  if (lh) t.lineHeight    = { value: lh, unit: "PERCENT" };
  if (upper) t.textCase   = "UPPER";
  t.textAutoResize = "HEIGHT";
  if (width) t.resize(width, 1);
  return t;
}

// ── Frame factory ─────────────────────────────────────────────────────────────

function frame({ w, h, name = "", fills = [], layout, gap = 0,
                 pt = 0, pb = 0, pl = 0, pr = 0,
                 pSizing = "AUTO", cSizing = "AUTO",
                 pAlign = "MIN", cAlign = "MIN" } = {}) {
  const f = figma.createFrame();
  f.name   = name;
  f.fills  = fills;
  if (w && h) f.resize(w, h);
  if (layout) {
    f.layoutMode                = layout;
    f.primaryAxisSizingMode     = pSizing;
    f.counterAxisSizingMode     = cSizing;
    f.primaryAxisAlignItems     = pAlign;
    f.counterAxisAlignItems     = cAlign;
    f.itemSpacing               = gap;
    f.paddingTop    = pt;
    f.paddingBottom = pb;
    f.paddingLeft   = pl;
    f.paddingRight  = pr;
  }
  return f;
}

// ── Company icon ──────────────────────────────────────────────────────────────

function companyIcon(letter, color) {
  const f  = frame({ w: 20, h: 20, fills: solid(color), layout: "HORIZONTAL",
                     pSizing: "FIXED", cSizing: "FIXED",
                     pAlign: "CENTER", cAlign: "CENTER" });
  f.cornerRadius = 4;
  const t = text(letter, { size: 9, style: "Bold", color: C.white });
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  f.appendChild(t);
  return f;
}

// ── Highlight bullet (mixed bold + regular in one text node) ──────────────────

function hlItem(boldPart, rest) {
  const chars  = "• " + boldPart + rest;
  const boldTo = 2 + boldPart.length;  // "• " prefix + bold text
  const t = text(chars, { size: 9, color: C.body, width: ENTRY_W, lh: 162 });
  t.setRangeFontName(0, boldTo, { family: FONT, style: "SemiBold" });
  t.setRangeFontName(boldTo, chars.length, { family: FONT, style: "Regular" });
  t.setRangeFills(0, boldTo, solid(C.name));
  t.setRangeFills(boldTo, chars.length, solid(C.body));
  return t;
}

// ── Single CV entry ───────────────────────────────────────────────────────────

function buildEntry(e) {
  const col = frame({ layout: "VERTICAL", pSizing: "AUTO", cSizing: "FIXED", gap: 4 });
  col.resize(ENTRY_W, 1);

  // Date
  col.appendChild(
    text(e.date, { size: 8, style: "Medium", color: C.date, ls: 1.2, upper: true, width: ENTRY_W })
  );

  // Company title row (optional icon + name)
  if (e.iconColor) {
    const row = frame({ layout: "HORIZONTAL", pSizing: "AUTO", cSizing: "AUTO",
                        gap: 7, cAlign: "CENTER" });
    row.appendChild(companyIcon(e.iconLetter, e.iconColor));
    row.appendChild(text(e.company, { size: 13, style: "Bold", color: C.name,
                                      width: ENTRY_W - 27 }));
    col.appendChild(row);
  } else {
    col.appendChild(text(e.company, { size: e.sm ? 11 : 13, style: "Bold",
                                      color: C.name, width: ENTRY_W }));
  }

  // Subtitle
  if (e.subtitle) {
    const sub = text(e.subtitle, {
      size: 9,
      style: e.sm ? "Regular" : "Italic",
      color: C.date,
      width: ENTRY_W,
      lh: 148,
    });
    if (!e.sm) sub.fontName = { family: FONT, style: "Italic" };
    col.appendChild(sub);
  }

  // Body
  if (e.body) {
    col.appendChild(text(e.body, { size: 9, color: C.body, width: ENTRY_W, lh: 165 }));
  }

  // Highlights block
  if (e.highlights) {
    const hlBox = frame({ layout: "VERTICAL", pSizing: "AUTO", cSizing: "FIXED",
                          gap: 5, pt: 8 });
    hlBox.resize(ENTRY_W, 1);
    hlBox.appendChild(text("Highlights", { size: 11, style: "Bold", color: C.name, width: ENTRY_W }));
    for (const h of e.highlights) hlBox.appendChild(hlItem(h.b, h.r));
    col.appendChild(hlBox);
  }

  return col;
}

// ── Section row (label + entries) ────────────────────────────────────────────

function buildSection(sec) {
  const row = frame({ layout: "HORIZONTAL", pSizing: "AUTO", cSizing: "AUTO",
                      gap: COL_GAP, cAlign: "MIN" });

  const lbl = text(sec.label, { size: 8, style: "Medium", color: C.label,
                                 ls: 1.8, lh: 140, align: "RIGHT",
                                 width: LABEL_W, upper: true });
  row.appendChild(lbl);

  const entries = frame({ layout: "VERTICAL", pSizing: "AUTO", cSizing: "FIXED", gap: 22 });
  entries.resize(ENTRY_W, 1);
  for (const e of sec.entries) entries.appendChild(buildEntry(e));
  row.appendChild(entries);

  return row;
}

// ── Page builder ──────────────────────────────────────────────────────────────

function buildPage(sections, isFirst) {
  const pg = frame({ w: PW, h: PH, fills: solid(C.white),
                     name: isFirst ? "CV – Page 1" : "CV – Page 2" });
  pg.clipsContent = true;

  // Top bar
  const topBar = frame({ w: PW, h: 9, fills: solid(C.bar), name: "top-bar" });
  pg.appendChild(topBar);
  topBar.x = 0; topBar.y = 0;

  let curY = 9;

  // Header (page 1 only)
  if (isFirst) {
    const header = frame({ layout: "VERTICAL", pSizing: "AUTO", cSizing: "FIXED",
                           gap: 0, pt: 34, pb: 22, pl: HPAD, pr: HPAD, name: "header" });
    header.resize(PW, 1);
    header.x = 0; header.y = curY;

    const nameT = text("Tamar Segura", { size: 40, style: "Bold", color: C.name });
    nameT.textAutoResize = "WIDTH_AND_HEIGHT";
    nameT.lineHeight = { value: 105, unit: "PERCENT" };
    header.appendChild(nameT);

    const spacer1 = frame({ w: 10, h: 5 }); header.appendChild(spacer1);

    const titleT = text("SENIOR PRODUCT DESIGNER",
                        { size: 9, color: C.label, ls: 2.8 });
    titleT.textAutoResize = "WIDTH_AND_HEIGHT";
    header.appendChild(titleT);

    const spacer2 = frame({ w: 10, h: 8 }); header.appendChild(spacer2);

    // Contacts
    const contacts = frame({ layout: "HORIZONTAL", pSizing: "AUTO", cSizing: "AUTO", gap: 22 });
    for (const c of ["LinkedIn", "Portfolio", "tamar.segura@gmail.com", "052-8780976"]) {
      const ct = text(c, { size: 9, color: C.body });
      ct.textAutoResize = "WIDTH_AND_HEIGHT";
      contacts.appendChild(ct);
    }
    header.appendChild(contacts);
    pg.appendChild(header);
    curY = header.y + header.height;
  }

  // Content
  const content = frame({ layout: "VERTICAL", pSizing: "AUTO", cSizing: "FIXED",
                           gap: 26, pt: isFirst ? 10 : 32, pb: 0, pl: HPAD, pr: HPAD,
                           name: "content" });
  content.resize(PW, 1);
  content.x = 0; content.y = curY;

  for (const sec of sections) content.appendChild(buildSection(sec));
  pg.appendChild(content);

  // Bottom bar
  const botBar = frame({ w: PW, h: 9, fills: solid(C.bar), name: "bottom-bar" });
  pg.appendChild(botBar);
  botBar.x = 0; botBar.y = PH - 9;

  return pg;
}

// ── CV Data ───────────────────────────────────────────────────────────────────

const PAGE1_SECTIONS = [
  {
    label: "Experience",
    entries: [
      {
        date: "2024 – Present",
        iconColor: C.guardz, iconLetter: "G",
        company: "Guardz | Senior Product designer",
        subtitle: "A cybersecurity platform that helps MSPs protect small businesses by detecting threats and automating security across digital assets.",
        body: "Leading design across core product features with a focus on business value, strategy, and measurable impact. Collaborated cross-functionally to align user experience with company OKRs and KPIs, driving product growth and delivering outcomes at scale.",
        highlights: [
          { b: "Define and drive design strategy",                              r: " across the product, collaborating with leadership and cross-functional partners to align UX with business goals" },
          { b: "Lead the creation and implementation of a scalable design system", r: ", working closely with developers to ensure consistency and efficiency" },
          { b: "Introduce and champion an \"Atomic Research\" methodology",     r: ", incorporating A/B testing, user interviews, screen recordings, and behavioral analytics" },
          { b: "Optimize product experiences",                                  r: " through continuous analysis of user feedback and usage data, improving adoption, usability, and engagement" },
          { b: "Contribute to roadmap planning",                                r: " by tying design initiatives to key company OKRs and KPIs, supporting measurable business impact." },
        ],
      },
      {
        date: "2023 – 2024",
        iconColor: C.rupert, iconLetter: "R",
        company: "Rupert | Senior Product designer",
        subtitle: "B2B platform connecting data insights to actions, enabling intuitive BI and process automation across sources.",
        body: "I led the entire product and marketing design domain, working closely with stakeholders to shape product strategy, conduct user research, design end-to-end experiences, and iterate based on usage insights. As the design lead in an early-stage company, I defined workflows, methodologies, and best practices to support efficient collaboration and scale. My work directly influenced product-market fit, improved team velocity, and contributed to measurable growth in user engagement and feature adoption.",
      },
      {
        date: "2021 – 2023",
        iconColor: C.similar, iconLetter: "S",
        company: "Similarweb | Senior Product designer",
        subtitle: "All in one Website analytics & competitive traffic intelligence platform.",
        body: "Owned design for a B2C incubation team focused on growth-driven product experiences. Collaborated closely with product, engineering, and marketing to define user flows, visual language, and deliver pixel-perfect designs.",
      },
      {
        date: "2020 – 2021",
        iconColor: C.wix, iconLetter: "W",
        company: "Wix | Product Designer",
        subtitle: "Web platform for creating professional-looking personal, and business websites.",
        body: "Led end-to-end design of Wix's internal B2B \"Dealer\" platform, enabling personalized user experiences. Managed research, ideation, wireframing, prototyping, and design QA. Defined user journeys and information architecture for core product features.",
      },
      {
        date: "2018 – 2020",
        iconColor: C.coro, iconLetter: "C",
        company: "Coro (Coronet) | Product designer",
        subtitle: "Cloud-based security management B2B platform, in partnership with Lenovo Home and Dropbox",
      },
    ],
  },
];

const PAGE2_SECTIONS = [
  {
    label: "Teaching",
    entries: [
      { date: "2023 – Present", company: "Holon Institute of Technology | Lecturer",        subtitle: "UX/UI, Interactive Design Workshop – B.Des – Visual Communication", sm: true },
      { date: "2022 – 2024",   company: "College of Management Academic Studies | Lecturer", body: "• UX/UI, Interactive Design Workshop – B.Des – Spatial Visual Communication\n• Digital Interfaces Lab – M.Des – entrepreneurship & innovation", sm: true },
      { date: "2021 – 2022",   company: "The Open University of Israel | Lecturer",          subtitle: "Interactive Design Workshop – diploma studies – Digital Design", sm: true },
    ],
  },
  {
    label: "Education",
    entries: [
      { date: "2019",      company: "User Interface Design",           subtitle: "Create Future School",           sm: true },
      { date: "2017",      company: "User Experience Design",          subtitle: "Create Future School",           sm: true },
      { date: "2007 – 2011", company: "Bachelor of Design interior design", subtitle: "Holon Institute of Technology", sm: true },
    ],
  },
  {
    label: "Community &\nMentorship",
    entries: [
      { date: "2024 – Present", company: "The Good Interview podcast | Co-host",               body: "Co-host The Good Interview, a podcast guiding designers through the job search with candid conversations and expert insights.", sm: true },
      { date: "2019 – Present", company: "Startup Designers community | Co-manager",           body: "Co-manage Startup Designers, a leading design community in Israel, writing its monthly newsletter for thousands of local designers.", sm: true },
      { date: "2019 – Present", company: "The Product Lounge & Startup Designers | Mentor",    body: "Design mentor assisting emerging designers to construct their portfolios, prepare for interviews and home assignments, etc.", sm: true },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

const newPage = figma.createPage();
newPage.name   = "CV – Tamar Segura";
figma.currentPage = newPage;

const p1 = buildPage(PAGE1_SECTIONS, true);
figma.currentPage.appendChild(p1);
p1.x = 0; p1.y = 0;

const p2 = buildPage(PAGE2_SECTIONS, false);
figma.currentPage.appendChild(p2);
p2.x = PW + 48; p2.y = 0;

figma.viewport.scrollAndZoomIntoView([p1, p2]);
figma.closePlugin("✅ Done! New page 'CV – Tamar Segura' created.");

})();
