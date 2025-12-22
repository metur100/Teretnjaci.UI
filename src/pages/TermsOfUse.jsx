import { useEffect } from "react";

const TermsOfUse = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="container"
      style={{ padding: "2rem 1rem", maxWidth: "800px", margin: "0 auto" }}
    >
      <h1 style={{ marginBottom: "2rem" }}>Uslovi korištenja</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Općenito</h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Dobrodošli na Teretnjaci.ba. Korištenjem naše web stranice i usluga,
          pristajete na ove Uslove korištenja. Molimo vas da pažljivo pročitate
          ove uvjete prije korištenja naših usluga. Ako se ne slažete s bilo
          kojim dijelom ovih uvjeta, nemojte koristiti našu web stranicu.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Definicije</h2>
        <p
          style={{
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            marginBottom: "1rem",
          }}
        >
          U ovim Uslovima korištenja:
        </p>
        <ul
          style={{
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            paddingLeft: "1.5rem",
          }}
        >
          <li>
            "Teretnjaci.ba", "mi", "nas" ili "naš" odnosi se na vlasnika i
            operatera web stranice
          </li>
          <li>
            "Korisnik", "vas" ili "vaš" odnosi se na svaku osobu koja pristupa i
            koristi našu web stranicu
          </li>
          <li>
            "Usluge" odnosi se na sve usluge, sadržaj i funkcionalnosti dostupne
            na Teretnjaci.ba
          </li>
          <li>
            "Sadržaj" uključuje tekst, slike, podatke, informacije i druge
            materijale dostupne na stranici
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Prihvaćanje uvjeta
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Korištenjem Teretnjaci.ba potvrđujete da ste navršili 18 godina života
          ili da koristite web stranicu pod nadzorom roditelja ili staratelja.
          Također potvrđujete da imate pravnu sposobnost da se obvezujete prema
          ovim Uslovima korištenja.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Korištenje usluga
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Dozvoljeno vam je koristiti našu web stranicu i usluge samo u skladu s
          ovim Uslovima korištenja i važećim zakonskim propisima. Slažete se da
          nećete:
        </p>
        <ol
          style={{
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            paddingLeft: "1.5rem",
          }}
        >
          <li>
            Koristiti web stranicu na bilo koji način koji može oštetiti,
            onemogućiti ili opteretiti našu infrastrukturu
          </li>
          <li>
            Pokušavati pristupiti dijelovima web stranice koji nisu javno
            dostupni
          </li>
          <li>
            Koristiti automatizirane alate (botove) za prikupljanje podataka bez
            našeg prethodnog pismenog odobrenja
          </li>
          <li>Objavljivati lažne, uvredljive ili nezakonite sadržaje</li>
          <li>Kršiti intelektualna prava drugih korisnika ili trećih strana</li>
        </ol>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Registracija i račun
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Neki dijelovi naših usluga mogu zahtijevati registraciju i kreiranje
          korisničkog računa. Prilikom registracije, dužni ste pružiti točne,
          potpune i ažurne informacije. Odgovorni ste za održavanje
          povjerljivosti vašeg korisničkog računa i lozinke, te za sve
          aktivnosti koje se odvijaju pod vašim računom.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Intelektualno vlasništvo
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Sav sadržaj na Teretnjaci.ba, uključujući ali ne ograničavajući se na
          tekst, grafikone, logotipe, slike, softver i druge materijale,
          zaštićen je autorskim pravima, žigovima i drugim zakonima o
          intelektualnom vlasništvu. Vlasništvo nad svim tim sadržajem pripada
          Teretnjaci.ba ili njenim davateljima sadržaja. Ne smijete
          reproducirati, distribuirati, mijenjati ili stvarati izvedena djela
          bez našeg prethodnog pismenog odobrenja.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Korisnički sadržaj
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Ako objavljujete sadržaj na našoj web stranici (kao što su oglasi,
          komentari ili recenzije), dajete nam neisključivu, besplatnu, trajnu,
          svjetsku licencu za korištenje, reprodukciju, modificiranje,
          prilagodbu, objavljivanje i prevodenje tog sadržaja. Garantirate da
          posjedujete sva potrebna prava za objavljivanje tog sadržaja i da isti
          ne krši prava trećih strana.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Ograničenje odgovornosti
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Teretnjaci.ba i njeni zaposlenici, direktori i agenti neće biti
          odgovorni za bilo kakve izravne, neizravne, slučajne, posebne ili
          posljedične štete koje proizlaze iz:
        </p>
        <ol
          style={{
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            paddingLeft: "1.5rem",
          }}
        >
          <li>Korištenja ili nemogućnosti korištenja naše web stranice</li>
          <li>Bilo kakvih grešaka, propusta ili netočnosti u sadržaju</li>
          <li>Neovlaštenog pristupa ili manipulacije vašim podacima</li>
          <li>Obustave ili prekida prijenosa podataka</li>
          <li>
            Bilo kakvih virusa ili drugih štetnih komponenti koje mogu
            inficirati vašu opremu
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Odricanje od garancija
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Naša web stranica i usluge pružaju se "takvi kakvi jesu" i "prema
          dostupnosti". Ne dajemo nikakve izričite ili podrazumijevane
          garancije, uključujući ali ne ograničavajući se na garancije trgovine,
          prikladnosti za određenu svrhu i nepovređivanja prava. Ne garantiramo
          da će usluge biti neprekidne, pravovremene, sigurne ili bez grešaka.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Poveznice na treće stranke
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Naša web stranica može sadržavati poveznice na web stranice trećih
          strana koje nisu pod našom kontrolom. Ne preuzimamo odgovornost za
          sadržaj, politike privatnosti ili praksu tih web stranica. Korištenje
          poveznica na treće stranke je na vaš vlastiti rizik.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Prestanak korištenja
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Zadržavamo pravo da privremeno ili trajno obustavimo ili prekinemo vaš
          pristup našim uslugama, bez prethodne najave i bez odgovornosti prema
          vama, ako vjerujemo da ste prekršili ove Uslove korištenja ili ako to
          zahtijevaju zakonski propisi.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Promjene uvjeta
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Zadržavamo pravo da mijenjamo ove Uslove korištenja u bilo kojem
          trenutku. Sve promjene stupit će na snagu odmah nakon objavljivanja na
          ovoj stranici. Vaša daljnja upotreba naše web stranice nakon objave
          izmjena predstavlja vaše prihvaćanje tih promjena.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Mjerodavno pravo
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Ovi Uslovi korištenja regulirani su i tumačeni u skladu sa zakonima
          Bosne i Hercegovine. Svi sporovi koji proizlaze iz ili su povezani s
          ovim Uslovima bit će podvrgnuti isključivoj nadležnosti nadležnih
          sudova u Bosni i Hercegovini.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Kontakt</h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Ako imate bilo kakva pitanja u vezi s ovim Uslovima korištenja, molimo
          vas da nas kontaktirate putem{" "}
          <a
            href="mailto:info@teretnjaci.ba"
            style={{ color: "var(--primary-color)", textDecoration: "none" }}
            onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.target.style.textDecoration = "none")}
          >
            info@teretnjaci.ba
          </a>
        </p>
        <p
          style={{
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            fontStyle: "italic",
            marginTop: "1rem",
          }}
        >
          Datum stupanja na snagu: 1. januar 2024.
        </p>
      </section>
    </div>
  );
};

export default TermsOfUse;
