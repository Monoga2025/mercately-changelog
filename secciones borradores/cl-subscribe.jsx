// Borrador — bloque "Recibe el changelog" (desactivado del hero el 27 May 2026)
// Para reactivar: pegar dentro de <div className="cl-hero-grid"> en ChangelogHero
// y restaurar grid-template-columns:1.2fr .8fr en .cl-hero-grid.

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
