// ─────────────────────────────────────────────────────────────────────────────
// Figma Plugin: Lior Wenger CV – using Tamar Segura layout style
//
// How to run:
//   1. In Figma desktop, open your CV file
//   2. Menu → Plugins → Development → New Plugin
//   3. Choose "Run once" → click "Create plugin" anywhere on disk
//   4. Open the generated code.js and REPLACE its contents with this entire file
//   5. Back in Figma: Plugins → Development → [your plugin name] → Run
//   6. A new page called "CV – Lior Wenger" will be created in this file
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
  azami:   hex("#2B56C0"),   // Azami Global – blue
  wix:     hex("#E07828"),   // Wix – orange
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

const PW      = 595;
const PH      = 842;
const HPAD    = 48;
const LABEL_W = 136;
const COL_GAP = 20;
const ENTRY_W = PW - HPAD * 2 - LABEL_W - COL_GAP;   // 343

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
  const f = frame({ w: 20, h: 20, fills: solid(color), layout: "HORIZONTAL",
                    pSizing: "FIXED", cSizing: "FIXED",
                    pAlign: "CENTER", cAlign: "CENTER" });
  f.cornerRadius = 4;
  const t = text(letter, { size: 9, style: "Bold", color: C.white });
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  f.appendChild(t);
  return f;
}

// ── Highlight bullet (bold keyword + regular rest in one text node) ───────────

function hlItem(boldPart, rest) {
  const chars  = "• " + boldPart + rest;
  const boldTo = 2 + boldPart.length;
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

  // Highlights block (bold keyword + regular rest per bullet)
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

// ── Section row (label + stacked entries) ────────────────────────────────────

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

    const nameT = text("Lior Wenger", { size: 40, style: "Bold", color: C.name });
    nameT.textAutoResize = "WIDTH_AND_HEIGHT";
    nameT.lineHeight = { value: 105, unit: "PERCENT" };
    header.appendChild(nameT);

    const sp1 = frame({ w: 10, h: 5 }); header.appendChild(sp1);

    const titleT = text("PRODUCT DESIGNER", { size: 9, color: C.label, ls: 2.8 });
    titleT.textAutoResize = "WIDTH_AND_HEIGHT";
    header.appendChild(titleT);

    const sp2 = frame({ w: 10, h: 8 }); header.appendChild(sp2);

    // Contacts row
    const contacts = frame({ layout: "HORIZONTAL", pSizing: "AUTO", cSizing: "AUTO", gap: 22 });
    for (const c of ["LinkedIn", "Portfolio", "liorbetser@gmail.com", "0522-346987"]) {
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

// ── CV Content (Lior Wenger) ──────────────────────────────────────────────────

const PAGE1_SECTIONS = [
  {
    label: "Experience",
    entries: [
      {
        date: "2024 – Present",
        iconColor: C.azami, iconLetter: "A",
        company: "Azami Global | Product Designer",
        subtitle: "B2B SaaS platform for enterprise workflow management.",
        highlights: [
          { b: "Leading UX design",                                                 r: " for a B2B SaaS platform, owning the end-to-end design process from discovery to delivery for complex workflows and system features." },
          { b: "Conducting user research and usability testing",                    r: " to deeply understand client needs, uncover pain points, and continuously refine user flows and interaction patterns." },
          { b: "Collaborating cross-functionally",                                  r: " with product management and engineering teams to translate complex requirements into user-centered, scalable design solutions." },
          { b: "Defining and iterating on wireframes, prototypes, and high-fidelity designs", r: " in Figma, contributing to design system standards and delivering clear specifications for developers." },
          { b: "Making AI tools an integral part of the product building process",  r: " and creating a unified workflow across design, research, product, and engineering." },
        ],
      },
      {
        date: "2021 – 2023",
        iconColor: C.wix, iconLetter: "W",
        company: "Wix.com | Product Designer",
        subtitle: "Web platform for creating professional websites, serving over 200M users worldwide.",
        body: "Owned the full design process for product initiatives — studying market trends, competitor analysis, and user data to form design and product recommendations.\nCollaborated with UX designers, product managers, and frontend developers to understand user requirements and deliver clear, accessible design specs aligned with product goals.\nDrove design consistency across product surfaces, ensuring experiences were on-brand, scalable, and optimized for user engagement.",
      },
      {
        date: "2015 – 2021",
        iconColor: C.wix, iconLetter: "W",
        company: "Wix.com | Web & Brand Designer",
        subtitle: "Web platform for creating professional websites, serving over 200M users worldwide.",
        body: "Owned end-to-end creative projects spanning brand identity, UI/UX design, landing pages, campaigns, banners, emails — reaching millions of users daily.\nDeveloped strong visual language and brand concepts, collaborating with stakeholders to translate strategic goals into compelling digital experiences.\nQuickly adapted to new domains, tools, and technologies, delivering innovative design solutions across diverse digital and print assets.",
      },
    ],
  },
];

const PAGE2_SECTIONS = [
  {
    label: "Education",
    entries: [
      {
        date: "2021 – 2022",
        company: "UX Program",
        subtitle: "Create UX School",
        body: "Completed an intensive program focused on product design and characterization processes with an emphasis on correct work methodologies. Developed expertise in entire product processes, from research to testing and optimization.",
        sm: true,
      },
      {
        date: "2011",
        company: "Graphic Design Studies",
        subtitle: "6B Studio",
        sm: true,
      },
      {
        date: "2005 – 2008",
        company: "L.L.B, Law",
        subtitle: "University of Haifa",
        sm: true,
      },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

const newPage = figma.createPage();
newPage.name   = "CV – Lior Wenger";
figma.currentPage = newPage;

const p1 = buildPage(PAGE1_SECTIONS, true);
figma.currentPage.appendChild(p1);
p1.x = 0; p1.y = 0;

const p2 = buildPage(PAGE2_SECTIONS, false);
figma.currentPage.appendChild(p2);
p2.x = PW + 48; p2.y = 0;

figma.viewport.scrollAndZoomIntoView([p1, p2]);
figma.closePlugin("✅ Done! New page 'CV – Lior Wenger' created.");

})();
