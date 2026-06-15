// Lior Wenger CV – Tamar Segura layout
// Auto-generated – creates new page "CV – Lior Wenger" in the current file

(async function () {

function hex(h) {
  return {
    r: parseInt(h.slice(1, 3), 16) / 255,
    g: parseInt(h.slice(3, 5), 16) / 255,
    b: parseInt(h.slice(5, 7), 16) / 255,
  };
}

const C = {
  bar:   hex("#BACDD8"),
  name:  hex("#1A1F2E"),
  label: hex("#8AAABB"),
  date:  hex("#6E9BAD"),
  body:  hex("#2D3142"),
  white: hex("#FFFFFF"),
  azami: hex("#2B56C0"),
  wix:   hex("#E07828"),
};

function solid(c) { return [{ type: "SOLID", color: c }]; }

const FONT = "Inter";
await Promise.all([
  figma.loadFontAsync({ family: FONT, style: "Regular" }),
  figma.loadFontAsync({ family: FONT, style: "Italic" }),
  figma.loadFontAsync({ family: FONT, style: "Medium" }),
  figma.loadFontAsync({ family: FONT, style: "SemiBold" }),
  figma.loadFontAsync({ family: FONT, style: "Bold" }),
]);

const PW      = 595;
const PH      = 842;
const HPAD    = 48;
const LABEL_W = 136;
const COL_GAP = 20;
const ENTRY_W = PW - HPAD * 2 - LABEL_W - COL_GAP;

// ── Factories ────────────────────────────────────────────────────────────────

function txt(chars, { size=9, style="Regular", color=C.body, width,
                      align="LEFT", ls, lh, upper }={}) {
  const t = figma.createText();
  t.fontName = { family: FONT, style };
  t.characters = chars;
  t.fontSize = size;
  t.fills = solid(color);
  t.textAlignHorizontal = align;
  if (ls)    t.letterSpacing = { value: ls, unit: "PIXELS" };
  if (lh)    t.lineHeight    = { value: lh, unit: "PERCENT" };
  if (upper) t.textCase      = "UPPER";
  t.textAutoResize = "HEIGHT";
  if (width) t.resize(width, 1);
  return t;
}

function frm({ w, h, name="", fills=[], layout, gap=0,
               pt=0, pb=0, pl=0, pr=0,
               pSz="AUTO", cSz="AUTO", pAl="MIN", cAl="MIN" }={}) {
  const f = figma.createFrame();
  f.name = name; f.fills = fills;
  if (w && h) f.resize(w, h);
  if (layout) {
    f.layoutMode = layout;
    f.primaryAxisSizingMode  = pSz;
    f.counterAxisSizingMode  = cSz;
    f.primaryAxisAlignItems  = pAl;
    f.counterAxisAlignItems  = cAl;
    f.itemSpacing            = gap;
    f.paddingTop = pt; f.paddingBottom = pb;
    f.paddingLeft = pl; f.paddingRight = pr;
  }
  return f;
}

function icon(letter, color) {
  const f = frm({ w:20, h:20, fills:solid(color), layout:"HORIZONTAL",
                  pSz:"FIXED", cSz:"FIXED", pAl:"CENTER", cAl:"CENTER" });
  f.cornerRadius = 4;
  const t = txt(letter, { size:9, style:"Bold", color:C.white });
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  f.appendChild(t);
  return f;
}

function bullet(boldPart, rest) {
  const chars = "• " + boldPart + rest;
  const bEnd  = 2 + boldPart.length;
  const t = txt(chars, { size:9, color:C.body, width:ENTRY_W, lh:162 });
  t.setRangeFontName(0, bEnd, { family:FONT, style:"SemiBold" });
  t.setRangeFontName(bEnd, chars.length, { family:FONT, style:"Regular" });
  t.setRangeFills(0, bEnd, solid(C.name));
  t.setRangeFills(bEnd, chars.length, solid(C.body));
  return t;
}

// ── Entry ────────────────────────────────────────────────────────────────────

function buildEntry(e) {
  const col = frm({ layout:"VERTICAL", pSz:"AUTO", cSz:"FIXED", gap:4 });
  col.resize(ENTRY_W, 1);

  col.appendChild(txt(e.date, { size:8, style:"Medium", color:C.date,
                                 ls:1.2, upper:true, width:ENTRY_W }));

  if (e.iconColor) {
    const row = frm({ layout:"HORIZONTAL", pSz:"AUTO", cSz:"AUTO", gap:7, cAl:"CENTER" });
    row.appendChild(icon(e.iconLetter, e.iconColor));
    row.appendChild(txt(e.company, { size:13, style:"Bold", color:C.name, width:ENTRY_W-27 }));
    col.appendChild(row);
  } else {
    col.appendChild(txt(e.company, { size:e.sm?11:13, style:"Bold", color:C.name, width:ENTRY_W }));
  }

  if (e.subtitle) {
    const sub = txt(e.subtitle, { size:9, color:C.date, width:ENTRY_W, lh:148 });
    sub.fontName = { family:FONT, style: e.sm ? "Regular" : "Italic" };
    col.appendChild(sub);
  }

  if (e.body) {
    col.appendChild(txt(e.body, { size:9, color:C.body, width:ENTRY_W, lh:165 }));
  }

  if (e.highlights) {
    const box = frm({ layout:"VERTICAL", pSz:"AUTO", cSz:"FIXED", gap:5, pt:8 });
    box.resize(ENTRY_W, 1);
    box.appendChild(txt("Highlights", { size:11, style:"Bold", color:C.name, width:ENTRY_W }));
    for (const h of e.highlights) box.appendChild(bullet(h.b, h.r));
    col.appendChild(box);
  }

  return col;
}

// ── Section ──────────────────────────────────────────────────────────────────

function buildSection(sec) {
  const row = frm({ layout:"HORIZONTAL", pSz:"AUTO", cSz:"AUTO", gap:COL_GAP, cAl:"MIN" });

  const lbl = txt(sec.label, { size:8, style:"Medium", color:C.label,
                                 ls:1.8, lh:140, align:"RIGHT", width:LABEL_W, upper:true });
  row.appendChild(lbl);

  const col = frm({ layout:"VERTICAL", pSz:"AUTO", cSz:"FIXED", gap:22 });
  col.resize(ENTRY_W, 1);
  for (const e of sec.entries) col.appendChild(buildEntry(e));
  row.appendChild(col);

  return row;
}

// ── Page ─────────────────────────────────────────────────────────────────────

function buildPage(sections, isFirst) {
  // Frame is A4 sized as a visual guide; clipsContent=false so highlights never get cut
  const pg = frm({ w:PW, h:PH, fills:solid(C.white),
                   name: isFirst ? "CV – Page 1" : "CV – Page 2" });
  pg.clipsContent = false;   // ← never cuts content

  const topBar = frm({ w:PW, h:9, fills:solid(C.bar), name:"top-bar" });
  pg.appendChild(topBar);
  topBar.x = 0; topBar.y = 0;

  let curY = 9;

  if (isFirst) {
    const header = frm({ layout:"VERTICAL", pSz:"AUTO", cSz:"FIXED",
                         gap:0, pt:34, pb:22, pl:HPAD, pr:HPAD, name:"header" });
    header.resize(PW, 1);
    header.x = 0; header.y = curY;

    const nameT = txt("Lior Wenger", { size:40, style:"Bold", color:C.name });
    nameT.textAutoResize = "WIDTH_AND_HEIGHT";
    nameT.lineHeight = { value:105, unit:"PERCENT" };
    header.appendChild(nameT);

    header.appendChild(frm({ w:10, h:5 }));

    const titleT = txt("PRODUCT DESIGNER", { size:9, color:C.label, ls:2.8 });
    titleT.textAutoResize = "WIDTH_AND_HEIGHT";
    header.appendChild(titleT);

    header.appendChild(frm({ w:10, h:8 }));

    const contacts = frm({ layout:"HORIZONTAL", pSz:"AUTO", cSz:"AUTO", gap:22 });
    for (const c of ["LinkedIn", "Portfolio", "liorbetser@gmail.com", "0522-346987"]) {
      const ct = txt(c, { size:9, color:C.body });
      ct.textAutoResize = "WIDTH_AND_HEIGHT";
      contacts.appendChild(ct);
    }
    header.appendChild(contacts);
    pg.appendChild(header);
    curY = header.y + header.height;
  }

  const content = frm({ layout:"VERTICAL", pSz:"AUTO", cSz:"FIXED",
                         gap:26, pt:isFirst?10:32, pb:32, pl:HPAD, pr:HPAD, name:"content" });
  content.resize(PW, 1);
  content.x = 0; content.y = curY;
  for (const sec of sections) content.appendChild(buildSection(sec));
  pg.appendChild(content);

  // Bottom bar sits at A4 boundary as a guide line
  const botBar = frm({ w:PW, h:9, fills:solid(C.bar), name:"bottom-bar" });
  pg.appendChild(botBar);
  botBar.x = 0; botBar.y = PH - 9;

  return pg;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const PAGE1 = [{
  label: "Experience",
  entries: [
    {
      date: "2024 – Present",
      iconColor: C.azami, iconLetter: "A",
      company: "Azami Global | Product Designer",
      subtitle: "B2B SaaS platform for enterprise workflow management.",
      highlights: [
        { b: "Leading UX design",                                                  r: " for a B2B SaaS platform, owning the end-to-end design process from discovery to delivery for complex workflows and system features." },
        { b: "Conducting user research and usability testing",                     r: " to deeply understand client needs, uncover pain points, and continuously refine user flows and interaction patterns." },
        { b: "Collaborating cross-functionally",                                   r: " with product management and engineering teams to translate complex requirements into user-centered, scalable design solutions." },
        { b: "Defining and iterating on wireframes, prototypes, and high-fidelity designs", r: " in Figma, contributing to design system standards and delivering clear specifications for developers." },
        { b: "Making AI tools an integral part of the product building process",   r: " and creating a unified workflow across design, research, product, and engineering." },
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
}];

const PAGE2 = [{
  label: "Education",
  entries: [
    {
      date: "2021 – 2022",
      company: "UX Program",
      subtitle: "Create UX School",
      body: "Completed an intensive program focused on product design and characterization processes with an emphasis on correct work methodologies. Developed expertise in entire product processes, from research to testing and optimization.",
      sm: true,
    },
    { date: "2011",      company: "Graphic Design Studies", subtitle: "6B Studio",           sm: true },
    { date: "2005–2008", company: "L.L.B, Law",             subtitle: "University of Haifa", sm: true },
  ],
}];

// ── Build ─────────────────────────────────────────────────────────────────────

const newPage = figma.createPage();
newPage.name = "CV – Lior Wenger";
figma.currentPage = newPage;

const p1 = buildPage(PAGE1, true);
figma.currentPage.appendChild(p1);
p1.x = 0; p1.y = 0;

const p2 = buildPage(PAGE2, false);
figma.currentPage.appendChild(p2);
p2.x = PW + 48; p2.y = 0;

figma.viewport.scrollAndZoomIntoView([p1, p2]);
figma.closePlugin("✅ Done! Page 'CV – Lior Wenger' created.");

})();
