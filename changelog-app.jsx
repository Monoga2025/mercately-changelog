// Mercately — Changelog page app (self-contained, no external deps)
const { useState: useStateCL, useMemo: useMemoCL, useEffect: useEffectCL } = React;

// ── Inline icons (subset needed by this page) ──────────────────────────────
const Icon = ({ name, size = 18, style: extraStyle, ...rest }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle', ...extraStyle };
  const st = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'check':    return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M20 6L9 17l-5-5"/></svg>;
    case 'plus':     return <svg viewBox="0 0 24 24" style={s} {...st} strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
    case 'chev':     return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M6 9l6 6 6-6"/></svg>;
    case 'arrow-r':  return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case 'x':        return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'link':     return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1-1"/></svg>;
    case 'rocket':   return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M4.5 16.5c-1.5 1-2 5-2 5s4-.5 5-2c.6-.85.6-2.15-.1-2.85a2 2 0 0 0-2.9.85zM12 15l-3-3 8.5-8.5a3.54 3.54 0 0 1 5 5L14 17z"/><path d="M9 12l-4 1 1-4 3 3z"/></svg>;
    case 'spark':    return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case 'phone':    return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'video':    return <svg viewBox="0 0 24 24" style={s} {...st}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    case 'mail':     return <svg viewBox="0 0 24 24" style={s} {...st}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>;
    case 'globe':    return <svg viewBox="0 0 24 24" style={s} {...st}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>;
    case 'qr':       return <svg viewBox="0 0 24 24" style={s} {...st}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v3M14 21h3M21 21v-3"/></svg>;
    case 'twitter':  return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 8.5a12.94 12.94 0 0 1-9.4-4.77A4.48 4.48 0 0 0 4 9.71 4.46 4.46 0 0 1 2 9v.05A4.5 4.5 0 0 0 5.6 13.4 4.5 4.5 0 0 1 3 13.5 4.5 4.5 0 0 0 7.2 16.6 9 9 0 0 1 1 18.5 12.7 12.7 0 0 0 8 20.5c8.4 0 13-7 13-13v-.6A9.4 9.4 0 0 0 23 3z"/></svg>;
    case 'linkedin': return <svg viewBox="0 0 24 24" style={s} {...st}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
    default: return null;
  }
};

// ── Standalone Header ──────────────────────────────────────────────────────
function Header() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="https://www.mercately.com/" className="nav-logo">
          <span className="nav-logo-dot"></span>Mercately
        </a>
        <nav className="nav-links">
          <a href="https://www.mercately.com/#productos">Productos</a>
          <a href="https://www.mercately.com/precios">Precios</a>
          <a href="https://www.mercately.com/partners">Partners</a>
          <a href="https://monoga2025.github.io/mercately-changelog/" style={{color:'#fff',fontWeight:600}}>Changelog</a>
        </nav>
        <a href="https://app.mercately.com/register" className="nav-cta">
          Crear cuenta gratis
        </a>
      </div>
    </header>
  );
}

// ── Standalone Footer ──────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="cl-footer">
      <span>© {new Date().getFullYear()} Mercately — </span>
      <a href="https://www.mercately.com/">mercately.com</a>
      <a href="https://www.mercately.com/terminos">Términos</a>
      <a href="https://www.mercately.com/privacidad">Privacidad</a>
    </footer>
  );
}

const FILTERS = [
  { id: "all",         label: "Todo",        cls: "" },
  { id: "new",         label: "Nuevo",       cls: "t-new" },
  { id: "improvement", label: "Mejoras",     cls: "t-imp" },
  { id: "fix",         label: "Correcciones",cls: "t-fix" },
  { id: "api",         label: "API",         cls: "t-api" },
  { id: "mobile",      label: "Móvil",       cls: "t-mob" },
];

function ChangelogHero() {
  return (
    <section className="cl-hero">
      <div className="container cl-hero-grid">
        <div>
          <span className="eyebrow"><span className="dot"></span>Changelog · actualizado semanalmente</span>
          <h1>
            Lo nuevo en <span className="accent">Mercately</span>
          </h1>
          <p>
            Todas las novedades, mejoras y correcciones que vamos liberando.
            Toca cualquier release para ver el detalle. Suscríbete para enterarte antes que el resto del equipo.
          </p>
        </div>
        <div className="cl-subscribe">
          <h4>
            <span className="sigil"><Icon name="mail" size={13} /></span>
            Recibe el changelog
          </h4>
          <p>Un correo mensual con los releases más importantes. Sin spam.</p>
          <form className="cl-sub-form" onSubmit={(e) => { e.preventDefault(); alert('¡Suscrito! (demo)'); }}>
            <input type="email" placeholder="tu@empresa.com" required />
            <button type="submit">Suscribirme</button>
          </form>
          <div className="cl-sub-extras">
            <a href="#rss"><Icon name="globe" size={13} /> RSS</a>
            <a href="#twitter"><Icon name="twitter" size={13} /> Twitter</a>
            <a href="#roadmap"><Icon name="rocket" size={13} /> Roadmap público</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Toolbar({ filter, setFilter, query, setQuery, counts }) {
  return (
    <div className="cl-toolbar">
      <div className="container cl-toolbar-inner">
        <div className="cl-search">
          <span className="sicon"><Icon name="search" size={16} /></span>
          <input
            type="text"
            placeholder="Buscar en el changelog..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="cl-filters">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`cl-fchip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.id !== 'all' && <span className="swatch" style={{
                background:
                  f.id === 'new'         ? 'var(--cat-new)' :
                  f.id === 'improvement' ? 'var(--cat-imp)' :
                  f.id === 'fix'         ? 'var(--cat-fix)' :
                  f.id === 'api'         ? 'var(--cat-api)' :
                  f.id === 'mobile'      ? 'var(--cat-mob)' : '#000'
              }}></span>}
              {f.label}
              <span className="count">{counts[f.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MediaPlaceholder({ kind, label }) {
  const ico =
    kind === 'mobile'  ? <Icon name="phone" size={26} /> :
    kind === 'flow'    ? <Icon name="spark" size={26} /> :
    kind === 'catalog' ? <Icon name="qr" size={26} /> :
                         <Icon name="rocket" size={26} />;
  return (
    <div className="cl-media">
      <div className="stripe"></div>
      <div className="placeholder">
        <div className="ico">{ico}</div>
        <b>{label}</b>
        <span>screenshot · {kind}</span>
      </div>
    </div>
  );
}

function TimelineItem({ e, side, onOpen }) {
  return (
    <div id={e.id} className={`tl-item ${side}`}>
      <div className="tl-card-wrap">
        <article
          className="tl-card"
          onClick={() => onOpen(e.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onOpen(e.id); } }}
        >
          <div className="tl-meta">
            <span className="cl-version">{e.version}</span>
            {e.tags.slice(0, 2).map(t => (
              <span key={t} className={`cl-tag ${TAG_LABEL[t].cls}`}>
                <span className="dot"></span>{TAG_LABEL[t].label}
              </span>
            ))}
            {e.tags.length > 2 && (
              <span className="cl-tag" style={{background:'var(--bg)',color:'var(--ink-500)'}}>
                +{e.tags.length - 2}
              </span>
            )}
          </div>

          <h3>{e.title}</h3>

          <div className="tl-expand">
            Leer artículo
            <Icon name="arrow-r" size={14} />
          </div>
        </article>
      </div>

      <div className="tl-marker">
        <div className="tl-dot"></div>
        <div className="tl-date-pill">{e.date}</div>
      </div>
    </div>
  );
}

function ArticleOverlay({ entry, prev, next, onClose, onNav }) {
  // Lock body scroll while open
  useEffectCL(() => {
    if (!entry) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && prev) onNav(prev.id);
      else if (e.key === 'ArrowRight' && next) onNav(next.id);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [entry, prev, next]);

  if (!entry) return null;
  const e = entry;

  return (
    <div className="cl-article-overlay open" onClick={(ev) => { if (ev.target.classList.contains('cl-article-overlay')) onClose(); }}>
      <div className="article">
        <div className="article-topbar">
          <button className="back" onClick={onClose}>
            <Icon name="chev" size={16} style={{transform:'rotate(90deg)'}} />
            Volver al changelog
          </button>
          <div className="crumb">/ <b>{e.version}</b></div>
          <div className="right">
            <button className="nav-btn" title="Anterior (←)" onClick={() => prev && onNav(prev.id)} disabled={!prev}>
              <Icon name="chev" size={16} style={{transform:'rotate(90deg)'}} />
            </button>
            <button className="nav-btn" title="Siguiente (→)" onClick={() => next && onNav(next.id)} disabled={!next}>
              <Icon name="chev" size={16} style={{transform:'rotate(-90deg)'}} />
            </button>
            <button className="close-btn" title="Cerrar (Esc)" onClick={onClose}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>

        <header className="article-hero">
          <div className="meta">
            <span className="date">{e.date}</span>
            <span className="sep"></span>
            <span className="cl-version">{e.version}</span>
            <span className="sep"></span>
            <span><Icon name="video" size={13} style={{verticalAlign:'-2px',marginRight:4}} />{e.readTime}</span>
          </div>
          <div className="tags">
            {e.tags.map(t => (
              <span key={t} className={`cl-tag ${TAG_LABEL[t].cls}`}>
                <span className="dot"></span>{TAG_LABEL[t].label}
              </span>
            ))}
          </div>
          <h1>{e.title}</h1>
          <p className="lede">{e.lede}</p>
        </header>

        <div className="article-body">
          {e.media && <MediaPlaceholder kind={e.media.kind} label={e.media.label} />}

          {e.points && e.points.length > 0 && (
            <>
              <h4>Lo que cambia</h4>
              <ul className="cl-points">
                {e.points.map((p, i) => (
                  <li key={i}>
                    <span className="b">
                      {p.b === 'Fix' ? <Icon name="check" size={14} /> :
                       p.b === 'Mejora' ? <Icon name="spark" size={14} /> :
                       <Icon name="plus" size={14} />}
                    </span>
                    <span><b>{p.b}.</b> {p.t}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="article-author-card">
            <span className="av">{e.author.initials}</span>
            <div className="who">
              <b>{e.author.name}</b>
              <span>Publicado el {e.date}</span>
            </div>
            <div className="share">
              <button title="Copiar enlace"><Icon name="link" size={14} /></button>
              <button title="Compartir en X"><Icon name="twitter" size={14} /></button>
              <button title="Compartir en LinkedIn"><Icon name="linkedin" size={14} /></button>
            </div>
          </div>
        </div>

        <div className="article-nav">
          {prev ? (
            <button className="nav-card prev" onClick={() => onNav(prev.id)}>
              <div className="dir"><Icon name="chev" size={11} style={{transform:'rotate(90deg)'}} /> Anterior</div>
              <b>{prev.title}</b>
            </button>
          ) : <div className="nav-card empty"></div>}
          {next ? (
            <button className="nav-card next" onClick={() => onNav(next.id)}>
              <div className="dir">Siguiente <Icon name="chev" size={11} style={{transform:'rotate(-90deg)'}} /></div>
              <b>{next.title}</b>
            </button>
          ) : <div className="nav-card empty"></div>}
        </div>
      </div>
    </div>
  );
}

function RoadmapTeaser() {
  return (
    <div id="roadmap" className="cl-roadmap">
      <div className="label">Próximamente</div>
      <h3>Lo que estamos cocinando</h3>
      <p>Estos son los proyectos que verás en el changelog las próximas semanas. Vota o comenta cada uno en nuestro foro público.</p>
      <div className="rm-grid">
        <div className="rm-item">
          <div className="q">Q2 2026</div>
          <b>Inbox compartido con menciones internas (@equipo)</b>
        </div>
        <div className="rm-item">
          <div className="q">Q2 2026</div>
          <b>Integración nativa con HubSpot CRM</b>
        </div>
        <div className="rm-item">
          <div className="q">Q3 2026</div>
          <b>Voice notes con transcripción automática</b>
        </div>
      </div>
      <a className="rm-cta">
        Ir al roadmap completo <Icon name="arrow-r" size={14} />
      </a>
    </div>
  );
}

function ChangelogApp() {
  const [filter, setFilter] = useStateCL('all');
  const [query, setQuery]   = useStateCL('');
  const [openId, setOpenId] = useStateCL(null);

  const filtered = useMemoCL(() => {
    const q = query.trim().toLowerCase();
    return CHANGELOG.filter(e => {
      const tagMatch = filter === 'all' || e.tags.includes(filter);
      const qMatch = !q ||
        e.title.toLowerCase().includes(q) ||
        e.lede.toLowerCase().includes(q) ||
        e.version.toLowerCase().includes(q) ||
        (e.points || []).some(p => (p.b + ' ' + p.t).toLowerCase().includes(q));
      return tagMatch && qMatch;
    });
  }, [filter, query]);

  const counts = useMemoCL(() => {
    const c = { all: CHANGELOG.length };
    CHANGELOG.forEach(e => e.tags.forEach(t => { c[t] = (c[t] || 0) + 1; }));
    return c;
  }, []);

  // Open by hash on load (#v3-9-0 deep links to that article)
  useEffectCL(() => {
    const h = window.location.hash.replace('#', '');
    if (h && CHANGELOG.some(e => e.id === h)) setOpenId(h);
  }, []);

  // Article navigation traverses ALL entries (not just filtered)
  const openEntry = CHANGELOG.find(e => e.id === openId) || null;
  const openIdx = openEntry ? CHANGELOG.indexOf(openEntry) : -1;
  const prevEntry = openIdx > 0 ? CHANGELOG[openIdx - 1] : null;
  const nextEntry = openIdx >= 0 && openIdx < CHANGELOG.length - 1 ? CHANGELOG[openIdx + 1] : null;

  const handleOpen = (id) => {
    setOpenId(id);
    history.replaceState(null, '', '#' + id);
    // Scroll to top of overlay
    requestAnimationFrame(() => {
      const ov = document.querySelector('.cl-article-overlay');
      if (ov) ov.scrollTop = 0;
    });
  };
  const handleClose = () => {
    setOpenId(null);
    history.replaceState(null, '', window.location.pathname);
  };

  // Build rows, injecting year separators on year change
  const rows = [];
  let lastYear = null;
  filtered.forEach((e) => {
    const y = e.dateISO.slice(0, 4);
    if (y !== lastYear) {
      rows.push({ type: 'year', year: y, key: `y-${y}` });
      lastYear = y;
    }
    rows.push({ type: 'item', entry: e, key: e.id });
  });

  let itemIndex = 0;

  return (
    <>
      <Header />
      <ChangelogHero />
      <Toolbar filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} counts={counts} />
      <main className="cl-main">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="cl-empty" style={{maxWidth:520,margin:'0 auto'}}>
              <b>Sin resultados</b>
              Probá con otro término o limpia el filtro.
            </div>
          ) : (
            <div className="cl-timeline">
              {rows.map(r => {
                if (r.type === 'year') {
                  return (
                    <div key={r.key} className="cl-year-marker">
                      <span className="pill">{r.year}</span>
                    </div>
                  );
                }
                const side = itemIndex % 2 === 0 ? 'right' : 'left';
                itemIndex++;
                return (
                  <TimelineItem
                    key={r.key}
                    e={r.entry}
                    side={side}
                    onOpen={handleOpen}
                  />
                );
              })}
            </div>
          )}
          <RoadmapTeaser />
        </div>
      </main>
      <Footer />
      <ArticleOverlay
        entry={openEntry}
        prev={prevEntry}
        next={nextEntry}
        onClose={handleClose}
        onNav={handleOpen}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ChangelogApp />);
