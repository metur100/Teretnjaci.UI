import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="container"
      style={{ padding: "2rem 1rem", maxWidth: "800px", margin: "0 auto" }}
    >
      <h1 style={{ marginBottom: "2rem" }}>Politika privatnosti</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Privatnost i zaštita podataka
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Ovaj dokument predstavlja Politiku privatnosti i zaštitu podataka
          https://teretnjaci.ba/. Molimo vas da pažljivo pročitate sljedeće
          informacije kako biste razumjeli kako prikupljamo, koristimo,
          otkrivamo i štitimo vaše lične podatke na našoj web stranici.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Prikupljanje ličnih podataka
        </h2>
        <p
          style={{
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            marginBottom: "1rem",
          }}
        >
          Na našoj web stranici možete pregledavati sadržaj i koristiti određene
          usluge bez otkrivanja vaših osobnih podataka. Međutim, kako bismo vam
          pružili bolje iskustvo i prilagodili naše usluge vašim potrebama,
          možda ćemo zatražiti sljedeće podatke:
        </p>
        <ol
          style={{
            lineHeight: "1.6",
            color: "var(--text-secondary)",
            paddingLeft: "1.5rem",
          }}
        >
          <li>Ime i prezime</li>
          <li>E-mail adresa</li>
          <li>
            Ostali relevantni podaci koje sami dobrovoljno podijelite s nama.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Korištenje podataka
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Vaše lične podatke koristit ćemo isključivo u svrhu pružanja traženih
          usluga, odgovaranja na vaše upite i poboljšanja naše web stranice.
          Također, podaci se mogu koristiti u marketinške svrhe, uključujući
          slanje informativnih e-mailova i obavijesti o posebnim ponudama i
          promocijama. Međutim, uvijek imate mogućnost odjaviti se iz naše
          marketinške komunikacije.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Otkrivanje podataka trećim stranama
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Vaše lične podatke nećemo prodavati, iznajmljivati ili razmjenjivati s
          trećim stranama bez vašeg izričitog pristanka, osim u slučajevima gdje
          to zahtijeva zakon ili je nužno za pružanje traženih usluga. Možemo
          otkriti vaše podatke pouzdanim partnerima koji sudjeluju u pružanju
          usluga na našoj web stranici, uz uvjet da su obvezani čuvati
          povjerljivost tih podataka.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Zaštita podataka
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Važno nam je osigurati sigurnost vaših ličnih podataka. Poduzimamo
          razumne tehničke, organizacijske i administrativne mjere kako bismo
          spriječili neovlašten pristup, gubitak, krađu ili zloupotrebu podataka
          koje prikupljamo putem naše web stranice.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Kolačići (Cookies)
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Kada posjetite našu web stranicu, možemo koristiti kolačiće (cookies)
          kako bismo poboljšali vaše korisničko iskustvo i pratili anonimne
          informacije o korištenju web stranice. Možete odbiti kolačiće
          prilagodbom postavki vašeg preglednika, ali imajte na umu da neki
          dijelovi naše web stranice možda neće ispravno funkcionirati.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Poveznice na druge web stranice
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Naša web stranica može sadržavati poveznice na vanjske web stranice
          koje nisu pod našom kontrolom. Ne preuzimamo odgovornost za zaštitu
          privatnosti ili sadržaj tih web stranica. Preporučujemo vam da
          pažljivo pročitate politike privatnosti svake web stranice koju
          posjetite.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Vaša suglasnost
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Korištenjem naše web stranice izričito pristajete na prikupljanje,
          korištenje i otkrivanje vaših osobnih podataka u skladu s ovom
          Politikom privatnosti.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Promjene u Politici privatnosti
        </h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Možemo povremeno ažurirati ovu Politiku privatnosti kako bismo
          odražavali promjene u našim praksama ili zakonskim zahtjevima. Svaka
          izmjena stupit će na snagu objavljivanjem na ovoj web stranici.
          Preporučujemo vam da redovito provjeravate ovu stranicu kako biste
          bili informirani o najnovijim promjenama.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Kontakt</h2>
        <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
          Ako imate bilo kakva pitanja ili zabrinutosti vezane uz ovu Politiku
          privatnosti ili način na koji obrađujemo vaše lične podatke, slobodno
          nas kontaktirajte putem{" "}
          <a
            href="mailto:info@teretnjaci.ba"
            style={{ color: "var(--primary-color)", textDecoration: "none" }}
            onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.target.style.textDecoration = "none")}
          >
            info@teretnjaci.ba
          </a>
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
