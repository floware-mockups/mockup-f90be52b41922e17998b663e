// @ts-nocheck
// Generato da Floware alla pubblicazione (WZ-2123): componenti su misura della specifica.
// Ognuno si carica a parte (lazy) e passa da src/customGuard.ts: oggetti di base congelati
// prima del caricamento, uscita ricostruita con un elenco chiuso di tag e proprietà. Un
// errore resta nel suo ErrorBoundary e non ferma il resto del prototipo.
import { lazy, type ComponentType } from "react";
import { guardCustomModule } from "../customGuard.ts";
const loaders = { VerificaEquilibriBilancio: () => import("./VerificaEquilibriBilancio") };
export const customComponents: Record<string, ComponentType<never>> = Object.fromEntries(Object.entries(loaders).map(([name, load]) => [name, lazy(() => guardCustomModule(name, load))]));
// Caricati subito dopo l'avvio, così il primo clic è immediato; un errore resta al componente.
export const preloadCustomComponents = () => { for (const [name, load] of Object.entries(loaders)) guardCustomModule(name, load).catch(() => undefined); };
