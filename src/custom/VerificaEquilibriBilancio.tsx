// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("VerificaEquilibriBilancio");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("VerificaEquilibriBilancio");
import { useState } from "react";
import { useTable, Card, Badge, Select, TextInput, Button } from "../floware";

export default function VerificaEquilibriBilancio(props) {__mk();
  const table = useTable(props.pageId);
  const [rettCorr, setRettCorr] = useState("0");
  const [rettCap, setRettCap] = useState("0");
  const [dettagli, setDettagli] = useState(true);
  if (!table) return null;
  const richieste = ["Voce", "Tipo", "Importo", "Capitolo", "Parte di bilancio"];
  if (richieste.some((c) => (__mk(), table.column(c) < 0))) return <p>Per il controllo servono le colonne Voce, Tipo, Importo, Capitolo e Parte di bilancio.</p>;
  function numero(testo) {__mk();
    const pulito = testo.replaceAll("€", "").split(".").join("").replace(",", ".").trim();
    return pulito === "" ? Number("non valido") : Number(pulito);
  }
  function euro(n) {__mk();
    return new Intl.NumberFormat("it-IT", {style: "currency", currency: "EUR"}).format(n);
  }
  const opzioni = ["Da classificare", "Corrente", "Conto capitale", "Altre poste"];
  const righe = table.rows.map((r, i) => {__mk();
    const tipo = table.value(r, "Tipo").trim().toLowerCase();
    return {i, voce: table.value(r, "Voce"), capitolo: table.value(r, "Capitolo"), testo: table.value(r, "Importo"), importo: numero(table.value(r, "Importo")), entrata: tipo === "entrata", uscita: tipo === "spesa" || tipo === "uscita", parte: table.value(r, "Parte di bilancio")};
  });
  const errate = righe.filter((r) => (__mk(), !Number.isFinite(r.importo) || r.importo < 0 || (!r.entrata && !r.uscita)));
  const incomplete = righe.filter((r) => (__mk(), !opzioni.slice(1).includes(r.parte)));
  const valide = righe.filter((r) => (__mk(), Number.isFinite(r.importo) && r.importo >= 0 && (r.entrata || r.uscita)));
  function somma(entrata, parte) {__mk();
    return valide.filter((r) => (__mk(), r.entrata === entrata && (!parte || r.parte === parte))).reduce((n, r) => (__mk(), n + r.importo), 0);
  }
  const entrate = somma(true, "");
  const uscite = somma(false, "");
  const rc = numero(rettCorr);
  const rk = numero(rettCap);
  const rettificheValide = Number.isFinite(rc) && Number.isFinite(rk);
  const completo = righe.length > 0 && !errate.length && !incomplete.length && rettificheValide;
  const totale = entrate - uscite + (rettificheValide ? rc + rk : 0);
  const aggregati = ["Corrente", "Conto capitale", "Altre poste"];
  return <Card title="Equilibri di bilancio · competenza">
    <div className="space-y-4 text-(--mk-text)">
      <Badge tone="neutral">Simulazione · conformità normativa non attestata</Badge>
      <p>Gli importi della tabella sono trattati come previsioni di competenza di un unico esercizio. Non sono dati di cassa. Classifica ogni voce: il numero del capitolo, da solo, non identifica la parte di bilancio.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>Entrate valide<strong className="block">{euro(entrate)}</strong></div>
        <div>Uscite valide<strong className="block">{euro(uscite)}</strong></div>
        <div>Saldo grezzo<strong className="block">{euro(entrate - uscite)}</strong></div>
      </div>
      <Button variant="secondary" onClick={() => (__mk(), setDettagli(!dettagli))}>{dettagli ? "Nascondi voci" : "Mostra e classifica voci"}</Button>
      {dettagli && <div className="space-y-3">{righe.map((r) => (__mk(), <div key={r.i} className="rounded border border-(--mk-border) p-3">
        <strong>{r.voce}</strong><p>{r.capitolo} · {r.entrata ? "Entrata" : r.uscita ? "Uscita" : "Tipo non riconosciuto"} · {r.testo}</p>
        <Select label="Parte di bilancio" value={opzioni.includes(r.parte) ? r.parte : "Da classificare"} options={opzioni} onChange={(v) => (__mk(), table.setCell(r.i, "Parte di bilancio", v))} />
      </div>))}</div>}
      <p>Rettifiche nette di simulazione: valori positivi aumentano le risorse, negativi le riducono. Inserire solo effetti documentati non già compresi nelle righe; non sono importi suggeriti per ottenere il pareggio. Formato: 1.234,50.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label="Rettifiche nette parte corrente (€)" value={rettCorr} onChange={setRettCorr} />
        <TextInput label="Rettifiche nette conto capitale (€)" value={rettCap} onChange={setRettCap} />
      </div>
      {aggregati.map((parte) => {__mk();
        const e = somma(true, parte);
        const u = somma(false, parte);
        const rett = rettificheValide ? (parte === "Corrente" ? rc : parte === "Conto capitale" ? rk : 0) : 0;
        const saldo = e - u + rett;
        return <div key={parte} className="rounded border border-(--mk-border) p-3"><strong>{parte}</strong><p>Entrate {euro(e)} · Uscite {euro(u)} · Rettifiche {euro(rett)}</p><p>Saldo parziale: {euro(saldo)}</p>{saldo < -0.005 && <p className="text-(--mk-danger)">Disavanzo dell’aggregato: {euro(-saldo)}. Verificare coperture e rettifiche ammesse; non è da solo un esito normativo.</p>}</div>;
      })}
      {!completo ? <p className="text-(--mk-danger)">Verifica non completabile: {incomplete.length} voci da classificare, {errate.length} righe con importo o tipo non valido.{!rettificheValide && " Correggere le rettifiche."} Le righe non valide sono escluse dai totali.</p> : <div><strong>Saldo complessivo simulato: {euro(totale)}</strong><p className={Math.abs(totale) >= 0.005 ? "text-(--mk-danger)" : "text-(--mk-text)"}>{Math.abs(totale) < 0.005 ? "Pareggio numerico della simulazione. Non equivale a conformità normativa." : "Pareggio numerico non rispettato: scostamento " + euro(totale) + ". Un saldo positivo non basta a dimostrare il pareggio."}</p></div>}
      <p className="text-sm text-(--mk-muted)">Riferimenti per gli enti locali: art. 162, comma 6, D.Lgs. 267/2000; D.Lgs. 118/2011, allegato 4/2 e prospetti dell’allegato 9. Questi saldi non riproducono i prospetti normativi: occorrono titoli e tipologie, rimborso prestiti, FPV, risultato di amministrazione applicato, vincoli, accantonamenti, partite finanziarie e di giro, oltre alle verifiche di cassa e pluriennali. Le rettifiche nette non sostituiscono tali dettagli. Verifica dimostrativa su dati inventati, da validare dall’ufficio competente secondo la disciplina applicabile all’ente e all’esercizio.</p>
    </div>
  </Card>;
}
