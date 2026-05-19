// Barra superior fija del builder. Muestra el título del configurador y links
// de navegación hacia el configurador de landing y la guía de implementación en Notion.
// No lee ni escribe ningún estado — es puramente visual.
export function ReferralBuilderTopbar() {
  return (
    <header className="referral-builder-topbar">
      <div className="referral-builder-topbar-title">
        <h1>Configurador de Referral Pages</h1>
      </div>
      <div className="referral-builder-topbar-links">
        <a className="referral-builder-topbar-link" href="/landing-builder">
          Configurador landing
        </a>
        <a
          className="referral-builder-topbar-link"
          href="https://www.notion.so/emilabs/Career-Pages-Implementation-with-job-postings-e8bfe30ebe7641cbb91509170b13e949"
          target="_blank"
          rel="noreferrer"
        >
          Guía
        </a>
      </div>
    </header>
  );
}
