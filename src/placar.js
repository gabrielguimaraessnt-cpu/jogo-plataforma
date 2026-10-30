// Recordes online no Supabase (só fetch, sem biblioteca).
import { SUPABASE_URL, SUPABASE_CHAVE } from './config.js';

const cabecalhos = { apikey: SUPABASE_CHAVE, Authorization: `Bearer ${SUPABASE_CHAVE}`, 'Content-Type': 'application/json' };

export async function enviarRecorde({ nome, fase, tempoMs, caixas, frutas }) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/registrar_recorde`, {
    method: 'POST',
    headers: cabecalhos,
    body: JSON.stringify({ p_nome: nome, p_fase: fase, p_tempo_ms: Math.round(tempoMs), p_caixas: caixas, p_frutas: frutas }),
  });
  if (!r.ok) {
    const erro = await r.json().catch(() => ({}));
    throw new Error(erro.message || `erro ${r.status}`);
  }
  return r.json(); // id do recorde
}

export async function melhoresTempos(fase, limite = 10) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/recordes?select=id,nome,tempo_ms,caixas,frutas&fase=eq.${fase}&order=tempo_ms.asc&limit=${limite}`, { headers: cabecalhos });
  if (!r.ok) throw new Error(`erro ${r.status}`);
  return r.json();
}

export function formatarTempo(ms) {
  const total = ms / 1000;
  const min = Math.floor(total / 60);
  const seg = (total % 60).toFixed(1).padStart(4, '0');
  return `${min}:${seg}`;
}

function escapar(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function mostrarRecordes(elemento, fase, destacarId = null) {
  elemento.textContent = 'Carregando…';
  try {
    const lista = await melhoresTempos(fase);
    if (!lista.length) { elemento.innerHTML = '<p class="dica">Ninguém terminou esta fase ainda. Seja o primeiro!</p>'; return; }
    elemento.innerHTML = '<ol>' + lista.map((r) =>
      `<li class="${r.id === destacarId ? 'meu' : ''}"><span>${escapar(r.nome)}</span><span>${formatarTempo(r.tempo_ms)} · 📦${r.caixas}</span></li>`).join('') + '</ol>';
  } catch {
    elemento.innerHTML = '<p class="dica">Não foi possível carregar os recordes agora.</p>';
  }
}
