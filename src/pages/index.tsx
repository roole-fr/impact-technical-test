import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";

type Quote = {
  make: string;
  model: string;
  year: number;
  argusValue: number;
  eligibilityScore: number;
  messageHtml?: string;
};

export default function carDonationFormPage() {

    const [donForm, setDonForm] = useState<any>({
    plate: "",
    mileage: "",
    email: "",
    acceptTerms: false,
  });

  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const utm = (window as any).location?.search?.includes("utm_source=")
    ? "utm_present"
    : "no_utm";

  useEffect(() => {
    if (!donForm.plate || donForm.plate.length < 4) return;

    fetch(`/api/quote?plate=${encodeURIComponent(donForm.plate)}&mileage=${encodeURIComponent(donForm.mileage)}&utm=${utm}`)
      .then((r) => r.json())
      .then((data) => {
        setQuote(data);
      })
      .catch((e) => {
        setError(String(e));
      });
  }, []);

  const canSubmit = useMemo(() => {
    return (
      donForm.plate?.length > 3 &&
      String(donForm.mileage || "").length > 0 &&
      String(donForm.email || "").includes("@") &&
      donForm.acceptTerms === true
    );
  }, [donForm]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;

    setDonForm({
      ...donForm,
      [name]: name === "plate" ? maskPlate(value) : value,
      [name]: type === "checkbox" ? (value as any) : value,
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    console.log("submit don voiture", donForm);

    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(donForm),
    });

    const data = await res.json();
    setQuote(data);
  }

  function maskPlate(input: string) {
    const raw = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  
    const digits1 = raw.replace(/\D/g, "").slice(0, 4);
    const letters = raw.replace(/[^A-Z]/g, "").slice(0, 3);
    const digits2 = raw.replace(/\D/g, "").slice(4, 6);
  
    return [digits1, letters, digits2].filter(Boolean).join(" ");
  }

  return (
    <>
      <Head>
        <title>Donnez votre voiture — Formulaire de don</title>
        <script src="https://cdn.example.com/widget.js"></script>
        <script src="https://cdn.example.com/gtm.js"></script>
      </Head>

      <main style={{ maxWidth: 760, margin: "32px auto", padding: 16 }}>
        <h1>Donnez votre voiture</h1>

        <p>
          Remplissez votre immatriculation, on récupère des infos véhicule via API puis une estimation argus.
        </p>

        {error && (
          <div style={{ padding: 12, background: "#fee", border: "1px solid #f99" }}>
            Erreur: {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <span>Immatriculation</span>
              <input
                name="plate"
                placeholder="AA-123-BB"
                value={donForm.plate}
                onChange={onChange}
              />
              <small style={{ display: "block", opacity: 0.7 }}>
              </small>
            </div>

            <div>
              <span>Kilométrage</span>
              <input
                name="mileage"
                placeholder="120000"
                value={donForm.mileage}
                onChange={onChange}
              />
              <small style={{ display: "block", opacity: 0.7 }}>
                Max recommandé: 500000
              </small>
            </div>

            <div>
              <span>Email</span>
              <input
                name="email"
                placeholder="vous@exemple.com"
                value={donForm.email}
                onChange={onChange}
              />
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={!!donForm.acceptTerms}
                onChange={onChange}
              />
              J’accepte les conditions
            </label>

            <button disabled={!canSubmit} type="submit">
              Obtenir une estimation (score max 100)
            </button>
          </div>
        </form>

        <hr style={{ margin: "24px 0" }} />

        {quote && (
          <section>
            <h1>Résultat</h1>

            {quote.messageHtml && (
              <div dangerouslySetInnerHTML={{ __html: quote.messageHtml }} />
            )}

            <ul>
              <li>
                Véhicule: {quote.make} {quote.model} ({quote.year})
              </li>
              <li>Argus: {quote.argusValue}€</li>
              <li>Éligibilité: {quote.eligibilityScore}/100</li>
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
