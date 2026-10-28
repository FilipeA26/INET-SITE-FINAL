/**
 * Dados e soma do simulador "Monte seu combo" (porte do P6).
 *
 * Fontes (src/data/inet.ts, tabela de preços do Filipe de 26/10/2026):
 * - planos 700 Mega, 800 Mega e 1 Giga: PLAN_GROUPS "principais";
 * - INET TV: INET_TV.price; câmeras e streamings: ADDONS.
 * - Wi-Fi Mesh: valor FICTÍCIO (R$ 29,90) até a INET informar o preço. validar
 * Streaming já incluso no plano (Deezer no 700 e no 1 Giga, HBO Max no 800) sai a R$ 0,00,
 * conforme o campo `includes` de cada plano.
 */

import { ADDONS, INET_TV, PLAN_GROUPS, waLink, type Plan } from "./inet";

/** "99,90" → 99.9 */
export function parseBrl(price: string): number {
  const n = parseFloat(price.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** 99.9 → "R$ 99,90" */
export const formatBrl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const COMBO_PLANS: Plan[] = PLAN_GROUPS.find((g) => g.id === "principais")?.plans ?? [];

export type Addon = { id: string; name: string; price: number; text: string };

export const MESH_ADDON: Addon = { id: "mesh", name: "Rede Wi-Fi Mesh", price: 29.9, text: "Amplia o Wi-Fi para mais cômodos." }; // fictício — validar

export const TV_ADDON: Addon = { id: "tv", name: "INET TV", price: parseBrl(INET_TV.price), text: "Canais ao vivo, rádio e filmes." };

const addon = (list: { name: string; price: string }[], name: string) => parseBrl(list.find((a) => a.name === name)?.price ?? "0");

export type CameraId = "none" | "interna" | "externa";
export const CAMERA_OPTIONS: (Addon & { id: CameraId })[] = [
  { id: "none", name: "Sem câmera", price: 0, text: "Não incluir câmeras no combo." },
  { id: "interna", name: "Câmera interna", price: addon(ADDONS.smartHome, "Câmera interna"), text: "Para ambientes internos." },
  { id: "externa", name: "Câmera externa", price: addon(ADDONS.smartHome, "Câmera externa"), text: "Para áreas externas." },
];

/** `includedIn`: ids dos planos que já trazem o serviço (campo `includes` em inet.ts). */
export const STREAMING_OPTIONS: (Addon & { includedIn: string[] })[] = [
  { id: "disney", name: "Disney+", price: addon(ADDONS.streaming, "Disney+"), text: "Filmes e séries.", includedIn: [] },
  { id: "hbo", name: "HBO Max", price: addon(ADDONS.streaming, "HBO Max"), text: "Filmes e séries.", includedIn: ["800"] },
  { id: "globoplay", name: "GloboPlay Premium", price: addon(ADDONS.streaming, "GloboPlay Premium"), text: "Filmes e séries.", includedIn: [] },
  { id: "deezer", name: "Deezer", price: addon(ADDONS.streaming, "Deezer"), text: "Música.", includedIn: ["700", "1000"] },
];

export type ComboSelection = { planId: string; mesh: boolean; camera: CameraId; tv: boolean; streamings: string[] };

export type ComboLine = { title: string; detail?: string; price: number; included?: boolean };

export function comboLines(sel: ComboSelection) {
  const plan = COMBO_PLANS.find((p) => p.id === sel.planId) ?? COMBO_PLANS[0];
  const lines: ComboLine[] = [];
  if (plan) lines.push({ title: plan.name, detail: "Internet fibra", price: parseBrl(plan.price) });
  if (sel.mesh) lines.push({ title: MESH_ADDON.name, detail: "Valor fictício", price: MESH_ADDON.price });
  const cam = CAMERA_OPTIONS.find((c) => c.id === sel.camera);
  if (cam && cam.id !== "none") lines.push({ title: cam.name, price: cam.price });
  if (sel.tv) lines.push({ title: TV_ADDON.name, price: TV_ADDON.price });
  for (const s of STREAMING_OPTIONS) {
    if (!sel.streamings.includes(s.id)) continue;
    const included = s.includedIn.includes(plan?.id ?? "");
    lines.push({ title: s.name, detail: included ? "Incluso no plano" : undefined, price: included ? 0 : s.price, included });
  }
  // soma em centavos para não acumular erro de ponto flutuante
  const total = lines.reduce((sum, l) => sum + Math.round(l.price * 100), 0) / 100;
  return { plan, lines, total };
}

/** Mensagem para o comercial no WhatsApp com o resumo do combo. */
export function comboWhatsApp(sel: ComboSelection) {
  const { lines, total } = comboLines(sel);
  const text = [
    "Olá! Montei meu combo no site da INET e quero falar com o setor comercial:",
    "",
    ...lines.map((l) => `- ${l.title}: ${l.included ? "incluso no plano" : `${formatBrl(l.price)}/mês`}`),
    "",
    `Total estimado: ${formatBrl(total)}/mês`,
    "",
    "Podem confirmar a disponibilidade no meu endereço e as condições de contratação?",
  ].join("\n");
  return waLink(text);
}
