/**
 * Simulation d'entreprise : interface dans le navigateur.
 *
 * La partie est rejouée par le moteur (src/lib/sim/engine.ts) à partir de la
 * sauvegarde « réglages + code + décisions ». Tout reste sur l'appareil :
 * stockage local du navigateur, fichier téléchargé, fichier relu sur place.
 * Aucun HTML n'est interprété : le DOM est construit avec el() (textContent).
 */
import { downloadBlob, el, setChildren } from '../tool/dom';
import {
  defaultDecision,
  eoq,
  kpis,
  meetingEvents,
  MONTHS,
  monthOfWeek,
  monthStart,
  newConfig,
  policyFor,
  projectPlan,
  runGame,
  sigmaOf,
  suggestion,
  TOTAL_WEEKS,
  WEEKS_IN_MONTH,
  type Company,
  type Game,
  type GameConfig,
  type GameEvent,
  type ItemDecision,
  type MonthDecision,
} from '../lib/sim/engine';
import {
  LIMITS,
  parseSave,
  SAVE_APP,
  SAVE_VERSION,
  serialize,
  STORAGE_KEY,
  type SaveData,
} from '../lib/sim/save';
import { NEGOCE, PROFILE_KEYS, type Profile, type ProfileKey } from '../lib/sim/scenario';
import { randomSeed } from '../lib/sim/rng';
import type { Dict } from '../i18n/fr';

type T = Dict['sim'];
interface SimConfig {
  lang: 'fr' | 'en';
  locale: string;
  t: T;
}

const cfgNode = document.getElementById('sim-config');
const root = document.getElementById('sim-app');
if (cfgNode?.textContent && root) start(JSON.parse(cfgNode.textContent) as SimConfig, root);

function start(cfg: SimConfig, root: HTMLElement): void {
  const { t, locale, lang } = cfg;
  const scenario = NEGOCE;
  const nf0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  const monthFmt = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const fill = (tpl: string, vars: Record<string, string | number> = {}) =>
    tpl.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
  let save: SaveData | null = loadStored();
  let game: Game | null = null;
  let draft: MonthDecision = {};
  let view: 'home' | 'setup' | 'play' = 'home';
  let setupState: GameConfig = newConfig('normal', randomSeed());

  // --- Stockage local ----------------------------------------------------------
  function loadStored(): SaveData | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? parseSave(raw) : null;
    } catch {
      return null;
    }
  }
  function persist(): void {
    if (!save) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, serialize(save));
    } catch {
      // Stockage indisponible (navigation privée…) : la partie continue sans sauvegarde.
    }
  }
  function clearStored(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // rien
    }
  }

  // --- Formats -------------------------------------------------------------------
  const cur = () => save?.config.currency || setupState.currency || '€';
  const unit = () => save?.config.unit || t.setup.unitDefault;
  const NBSP = String.fromCharCode(160);
  function money(n: number): string {
    const sym = cur();
    const v = nf0.format(Math.abs(Math.round(n)));
    const sign = Math.round(n) < 0 ? '−' : '';
    if (lang === 'en' && ['€', '$', '£'].includes(sym)) return `${sign}${sym}${v}`;
    return `${sign}${v}${NBSP}${sym}`;
  }
  const qty = (n: number) => `${nf0.format(Math.round(n))}${NBSP}${unit()}`;
  const monthName = (m: number, cap = true) => {
    const name = monthFmt.format(new Date(Date.UTC(2001, ((m % 12) + 12) % 12, 15)));
    return cap ? name.charAt(0).toUpperCase() + name.slice(1) : name;
  };
  const monthLabel = (m: number, cap = true) =>
    fill(t.game.monthLabel, { month: monthName(m, cap), year: Math.floor(m / 12) + 1 });
  const itemName = (id: string) => `${id} · ${t.items[id as keyof T['items']] ?? id}`;

  // --- Partie ----------------------------------------------------------------------
  function recompute(): void {
    if (!save) return;
    game = runGame(save.config, { decisions: save.decisions, forced: save.forced }, save.week);
    if (game.awaiting) draft = structuredClone(defaultDecision(game));
  }
  function newSave(config: GameConfig): void {
    save = { app: SAVE_APP, version: SAVE_VERSION, config, decisions: [], forced: [], week: 0 };
    persist();
    recompute();
    view = 'play';
    render();
  }

  // --- Rendu général ---------------------------------------------------------------
  function render(): void {
    if (view === 'setup') setChildren(root, renderSetup());
    else if (view === 'play' && game) {
      if (game.finished) setChildren(root, renderEnd(game));
      else if (game.awaiting) setChildren(root, renderMeeting(game));
      else setChildren(root, renderWeek(game));
    } else setChildren(root, renderHome());
  }
  function scrollTop(): void {
    root.scrollIntoView({ block: 'start' });
    root.focus({ preventScroll: true });
  }

  const button = (label: string, onClick: () => void, secondary = false, attrs = {}) => {
    const b = el(
      'button',
      { type: 'button', class: secondary ? 'btn btn-secondary' : 'btn', ...attrs },
      label,
    );
    b.addEventListener('click', onClick);
    return b;
  };

  function downloadSave(): void {
    if (!save) return;
    const name = fill(t.saveFile, { seed: save.config.seed, month: (game?.month ?? 0) + 1 });
    downloadBlob(new Blob([serialize(save)], { type: 'application/json' }), name);
  }

  // --- Écran 1 : accueil ----------------------------------------------------------
  function renderHome(): HTMLElement {
    const error = el('p', { class: 'error-text', role: 'alert' });
    const file = el('input', {
      type: 'file',
      id: 'sim-file',
      accept: '.json,application/json',
      class: 'visually-hidden',
    });
    file.addEventListener('change', async () => {
      const f = file.files?.[0];
      if (!f) return;
      const parsed = f.size < 2_000_000 ? parseSave(await f.text()) : null;
      if (!parsed) {
        error.textContent = t.home.loadError;
        return;
      }
      save = parsed;
      persist();
      recompute();
      view = 'play';
      render();
    });
    const stored = save;
    const resume =
      stored &&
      button(
        fill(t.home.resume, {
          month: Math.min(MONTHS, monthOfWeek(Math.min(stored.week, TOTAL_WEEKS - 1)) + 1),
          company: stored.config.company || t.setup.companyDefault,
        }),
        () => {
          recompute();
          view = 'play';
          render();
        },
        true,
      );
    const fresh = button(t.home.newGame, () => {
      if (save && !window.confirm(t.home.replaceConfirm)) return;
      setupState = newConfig('normal', randomSeed());
      view = 'setup';
      render();
    });
    return el(
      'section',
      { class: 'card sim-home', 'aria-labelledby': 'sim-home-title' },
      el('h2', { id: 'sim-home-title' }, t.home.title),
      el('p', {}, t.home.text),
      el(
        'div',
        { class: 'sim-actions' },
        fresh,
        resume,
        button(t.home.load, () => file.click(), true),
        file,
      ),
      error,
      el('p', { class: 'field-hint' }, t.home.note),
    );
  }

  // --- Écran 2 : paramétrage ------------------------------------------------------
  function renderSetup(): HTMLElement {
    const c = setupState;
    const form = el('form', { class: 'card sim-setup', novalidate: true });
    const error = el('p', { class: 'error-text', role: 'alert' });
    const field = (id: string, label: string, control: HTMLElement, hint?: string) =>
      el(
        'div',
        { class: 'field' },
        el('label', { for: id }, label),
        control,
        hint ? el('span', { class: 'field-hint' }, hint) : null,
      );
    const company = el('input', {
      id: 'sim-company',
      type: 'text',
      maxlength: 80,
      value: c.company || t.setup.companyDefault,
    });
    const currencies = ['€', '$', '£', 'CHF'];
    const currency = el(
      'select',
      { id: 'sim-currency' },
      ...currencies.map((s) => el('option', { value: s, selected: c.currency === s }, s)),
      el('option', { value: 'other', selected: !currencies.includes(c.currency) }, t.setup.other),
    );
    const otherCur = el('input', {
      id: 'sim-currency-other',
      type: 'text',
      maxlength: 8,
      value: currencies.includes(c.currency) ? '' : c.currency,
      'aria-label': t.setup.otherSymbol,
      hidden: currencies.includes(c.currency),
    });
    currency.addEventListener('change', () => {
      otherCur.hidden = currency.value !== 'other';
    });
    const unitInput = el('input', {
      id: 'sim-unit',
      type: 'text',
      maxlength: 30,
      value: c.unit || t.setup.unitDefault,
      list: 'sim-units',
    });
    const units = el(
      'datalist',
      { id: 'sim-units' },
      ...t.setup.units.split('|').map((u) => el('option', { value: u })),
    );

    // Profil et paramètres
    const radios = el(
      'div',
      { class: 'radio-row', role: 'radiogroup', 'aria-labelledby': 'sim-profile-label' },
      ...PROFILE_KEYS.map((k) => {
        const r = el('input', {
          type: 'radio',
          name: 'profile',
          value: k,
          checked: c.profileKey === k,
        });
        r.addEventListener('change', () => {
          setupState = { ...readSetup(), profileKey: k, profile: { ...scenario.profiles[k] } };
          render();
        });
        return el('label', {}, r, t.setup.profiles[k]);
      }),
    );
    const numParam = (key: keyof Profile, step: string, min: number, max: number) => {
      const input = el('input', {
        type: 'number',
        id: `sim-p-${key}`,
        name: key,
        value: String(c.profile[key]),
        step,
        min,
        max,
        inputmode: 'decimal',
      });
      return input;
    };
    const selectParam = (key: 'events' | 'shortage', options: Record<string, string>) =>
      el(
        'select',
        { id: `sim-p-${key}`, name: key },
        ...Object.entries(options).map(([v, label]) =>
          el('option', { value: v, selected: c.profile[key] === v }, label),
        ),
      );
    const params: [keyof Profile, HTMLElement][] = [
      ['cv', numParam('cv', '0.05', LIMITS.cv[0], LIMITS.cv[1])],
      ['leadWeeks', numParam('leadWeeks', '1', LIMITS.leadWeeks[0], LIMITS.leadWeeks[1])],
      ['leadSd', numParam('leadSd', '0.5', LIMITS.leadSd[0], LIMITS.leadSd[1])],
      ['eventCount', numParam('eventCount', '1', LIMITS.eventCount[0], LIMITS.eventCount[1])],
      ['events', selectParam('events', t.setup.eventModes)],
      ['shortage', selectParam('shortage', t.setup.shortageModes)],
      ['warehouse', numParam('warehouse', '5', LIMITS.warehouse[0], 1000)],
    ];
    const paramTable = el(
      'div',
      { class: 'table-wrap' },
      el(
        'table',
        { class: 'sim-params' },
        el('caption', {}, t.setup.paramsCaption),
        el(
          'thead',
          {},
          el(
            'tr',
            {},
            el('th', { scope: 'col' }, t.setup.param),
            ...PROFILE_KEYS.map((k) =>
              el('th', { scope: 'col', class: 'num' }, t.setup.profiles[k]),
            ),
            el('th', { scope: 'col' }, t.setup.yours),
          ),
        ),
        el(
          'tbody',
          {},
          ...params.map(([key, control]) =>
            el(
              'tr',
              {},
              el('th', { scope: 'row' }, el('label', { for: control.id }, t.setup.params[key])),
              ...PROFILE_KEYS.map((k) => {
                const v = scenario.profiles[k][key];
                const shown =
                  key === 'events'
                    ? t.setup.eventModes[v as keyof T['setup']['eventModes']]
                    : key === 'shortage'
                      ? t.setup.shortageModes[v as keyof T['setup']['shortageModes']]
                      : nf2.format(v as number);
                return el('td', { class: 'num' }, shown);
              }),
              el('td', {}, control),
            ),
          ),
        ),
      ),
    );
    const seed = el('input', {
      id: 'sim-seed',
      type: 'number',
      min: 0,
      max: 999999,
      step: 1,
      value: String(c.seed),
      inputmode: 'numeric',
    });
    const reroll = button(
      t.setup.reroll,
      () => {
        seed.value = String(randomSeed());
      },
      true,
      { class: 'btn btn-secondary btn-small' },
    );

    function readSetup(): GameConfig {
      const profile = { ...setupState.profile };
      const fd = new FormData(form);
      for (const [key] of params) {
        const v = fd.get(key);
        if (key === 'events' || key === 'shortage') (profile as Record<string, unknown>)[key] = v;
        else {
          const n = Number(String(v ?? '').replace(',', '.'));
          (profile as Record<string, unknown>)[key] = Number.isFinite(n) ? n : NaN;
        }
      }
      const preset = scenario.profiles[setupState.profileKey as ProfileKey];
      const same =
        preset && (Object.keys(preset) as (keyof Profile)[]).every((k) => preset[k] === profile[k]);
      return {
        ...setupState,
        company: company.value.trim().slice(0, 80),
        currency:
          currency.value === 'other' ? otherCur.value.trim().slice(0, 8) || '€' : currency.value,
        unit: unitInput.value.trim().slice(0, 30) || t.setup.unitDefault,
        profile,
        profileKey: same || setupState.profileKey === 'custom' ? setupState.profileKey : 'custom',
        seed: Math.floor(Number(seed.value)),
      };
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const next = readSetup();
      const p = next.profile;
      const bad =
        !(p.cv >= LIMITS.cv[0] && p.cv <= LIMITS.cv[1]) ||
        !(p.leadWeeks >= LIMITS.leadWeeks[0] && p.leadWeeks <= LIMITS.leadWeeks[1]) ||
        !(p.leadSd >= LIMITS.leadSd[0] && p.leadSd <= LIMITS.leadSd[1]) ||
        !(p.eventCount >= LIMITS.eventCount[0] && p.eventCount <= LIMITS.eventCount[1]) ||
        !(p.warehouse >= LIMITS.warehouse[0] && p.warehouse <= LIMITS.warehouse[1]) ||
        !(next.seed >= 0 && next.seed <= 999999);
      if (bad) {
        error.textContent = t.setup.invalid;
        return;
      }
      next.profile = {
        ...p,
        leadWeeks: Math.round(p.leadWeeks),
        eventCount: Math.round(p.eventCount),
        warehouse: Math.round(p.warehouse),
      };
      setupState = next;
      newSave(next);
      scrollTop();
    });

    const cancel = button(
      t.setup.back,
      () => {
        view = 'home';
        render();
      },
      true,
    );
    form.append(
      el('h2', {}, t.setup.title),
      el(
        'div',
        { class: 'grid-fields' },
        field('sim-company', t.setup.company, company),
        el(
          'div',
          { class: 'field' },
          el('label', { for: 'sim-currency' }, t.setup.currency),
          el('div', { class: 'field-inline' }, currency, otherCur),
        ),
        field('sim-unit', t.setup.unit, unitInput),
      ),
      units,
      el('h3', { id: 'sim-profile-label' }, t.setup.profile),
      radios,
      el('p', { class: 'field-hint' }, t.setup.profileHint),
      paramTable,
      el('h3', {}, t.setup.seed),
      el(
        'div',
        { class: 'field-inline' },
        el('label', { for: 'sim-seed', class: 'visually-hidden' }, t.setup.seed),
        seed,
        reroll,
      ),
      el('p', { class: 'field-hint' }, t.setup.seedHint),
      error,
      el(
        'div',
        { class: 'sim-actions' },
        el('button', { type: 'submit', class: 'btn' }, t.setup.start),
        cancel,
      ),
    );
    return form;
  }

  // --- Bandeau commun -------------------------------------------------------------
  function header(g: Game, subtitle: string): HTMLElement {
    const you = kpis(g.player, g.week);
    const pilot = kpis(g.pilot, g.week);
    const stat = (label: string, value: string, sub: string) =>
      el(
        'div',
        { class: 'stat' },
        el('p', { class: 'stat-label' }, label),
        el('p', { class: 'stat-value' }, value),
        el('p', { class: 'stat-label' }, sub),
      );
    const pilotSub = (v: string) => fill(t.game.pilotValue, { value: v });
    return el(
      'div',
      { class: 'sim-head' },
      el(
        'h2',
        { id: 'sim-title' },
        fill(t.game.title, {
          company: g.config.company || t.setup.companyDefault,
          n: Math.min(MONTHS, g.month + 1),
        }),
      ),
      el('p', { class: 'sim-sub' }, subtitle),
      el(
        'div',
        { class: 'summary-cards' },
        stat(t.game.fillRate, pct.format(you.fillRate), pilotSub(pct.format(pilot.fillRate))),
        stat(t.game.stock, money(you.stockValue), pilotSub(money(pilot.stockValue))),
        stat(t.game.result, money(you.result), pilotSub(money(pilot.result))),
      ),
    );
  }

  function eventText(e: GameEvent): string {
    const vars = {
      item: itemName(e.item),
      month: monthLabel(e.month, false),
      q: nf0.format(scenario.items.find((i) => i.id === e.item)?.launchEstimate ?? 0),
      unit: unit(),
      weeks: e.factor,
    };
    const key = e.type === 'shift' ? (e.factor > 1 ? 'shiftUp' : 'shiftDown') : e.type;
    return fill(t.events[key], vars);
  }

  // --- Écran 3 : réunion S&OP ---------------------------------------------------------
  function renderMeeting(g: Game): HTMLElement {
    const m = g.month;
    const wrap = el('section', { class: 'sim-play', 'aria-labelledby': 'sim-title' });
    const { upcoming, past } = meetingEvents(g.world, m);

    // 1. Ce qui s'est passé
    const past1: Node[] = [];
    if (m === 0) past1.push(el('p', {}, t.game.firstMonth));
    else {
      const rec = g.player.months[m - 1];
      const pRec = g.pilot.months[m - 1];
      if (rec && pRec)
        past1.push(
          el(
            'p',
            {},
            fill(t.game.pastLine, {
              served: qty(rec.served),
              demand: qty(rec.demand),
              rate: pct.format(rec.fillRate),
              result: money(rec.result),
              pilot: money(pRec.result),
            }),
          ),
        );
      if (past.length > 0) past1.push(el('ul', {}, ...past.map((e) => el('li', {}, eventText(e)))));
      if (m >= 2) past1.push(...chartBlock(g, 'stock'));
    }

    // 3. PIC
    const planBox = el('div', { class: 'sim-plan' });
    const renderPlan = () => setChildren(planBox, planTable(g));
    renderPlan();

    // 4. Décisions
    const error = el('p', { class: 'error-text', role: 'alert' });
    const launch = button(fill(t.game.launch, { weeks: WEEKS_IN_MONTH[m] ?? 4 }), () =>
      commit(monthStart(m + 1)),
    );
    const weekMode = button(t.game.weekMode, () => commit(g.week + 1), true);
    function commit(week: number): void {
      if (!save || !valid()) {
        error.textContent = t.game.invalid;
        return;
      }
      save.decisions = [...save.decisions.slice(0, m), structuredClone(draft)];
      save.week = week;
      persist();
      recompute();
      render();
      scrollTop();
    }
    const invalid = new Set<string>();
    const valid = () => invalid.size === 0;
    const refresh = () => {
      launch.disabled = !valid();
      weekMode.disabled = !valid();
      if (valid()) error.textContent = '';
      renderPlan();
    };

    const rows = scenario.items.map((def) => {
      const st = g.player.items[def.id]!;
      const dec = draft[def.id] as ItemDecision;
      const ssCell = el('td', { class: 'num' });
      const ropCell = el('td', { class: 'num' });
      const eoqHint = el('span', { class: 'field-hint' });
      const update = () => {
        const p = policyFor(
          g.world.profile,
          dec,
          sigmaOf(st.errors, g.world.profile.cv, dec.forecast[0]),
        );
        ssCell.textContent = nf0.format(p.ss);
        ropCell.textContent = nf0.format(p.rop);
        const cost = def.unitCost * ((g.world.costFactor[def.id] as number[])[m] ?? 1);
        const avg = (dec.forecast[0] + dec.forecast[1] + dec.forecast[2]) / 3;
        eoqHint.textContent = fill(t.game.eoqHint, {
          q: nf0.format(eoq(avg, def.orderCost, cost, g.world.scenario.holdingRate)),
        });
      };
      const input = (
        field: 'f0' | 'f1' | 'f2' | 'service' | 'qty',
        value: number,
        label: string,
        min: number,
        max: number,
      ) => {
        const i = el('input', {
          type: 'number',
          value: String(value),
          min,
          max,
          step: field === 'service' ? '0.1' : '1',
          inputmode: 'decimal',
          'aria-label': label,
          class: 'sim-input',
          'data-item': def.id,
          'data-field': field,
        });
        const key = `${def.id}|${field}`;
        i.addEventListener('input', () => {
          const n = Number(i.value.trim().replace(',', '.'));
          const ok = i.value.trim() !== '' && Number.isFinite(n) && n >= min && n <= max;
          i.setAttribute('aria-invalid', ok ? 'false' : 'true');
          if (ok) {
            invalid.delete(key);
            if (field === 'service') dec.service = n;
            else if (field === 'qty') dec.qty = Math.round(n);
            else dec.forecast[Number(field.slice(1)) as 0 | 1 | 2] = n;
            update();
          } else invalid.add(key);
          refresh();
        });
        return i;
      };
      update();
      const onOrder = st.pipeline.reduce((s, l) => s + l.qty, 0);
      const name = itemName(def.id);
      return el(
        'tr',
        {},
        el(
          'th',
          { scope: 'row' },
          name,
          el(
            'span',
            { class: 'field-hint sim-block' },
            t.families[def.family as keyof T['families']],
          ),
        ),
        el(
          'td',
          { class: 'num' },
          nf0.format(st.onHand),
          st.backlog > 0
            ? el(
                'span',
                { class: 'field-hint sim-block' },
                fill(t.game.backlog, { n: nf0.format(st.backlog) }),
              )
            : null,
        ),
        el('td', { class: 'num' }, nf0.format(onOrder)),
        ...([0, 1, 2] as const).map((k) =>
          el(
            'td',
            {},
            input(
              `f${k}`,
              dec.forecast[k],
              fill(t.game.forecastLabel, { item: def.id, month: monthLabel(m + k, false) }),
              0,
              LIMITS.forecast,
            ),
          ),
        ),
        el(
          'td',
          {},
          input(
            'service',
            dec.service,
            fill(t.game.serviceLabel, { item: def.id }),
            LIMITS.serviceMin,
            LIMITS.serviceMax,
          ),
        ),
        ssCell,
        ropCell,
        el(
          'td',
          {},
          input('qty', dec.qty, fill(t.game.qtyLabel, { item: def.id }), 0, LIMITS.qty),
          el('span', { class: 'sim-block' }, eoqHint),
        ),
      );
    });

    const resetBtn = button(
      t.game.suggestions,
      () => {
        for (const def of scenario.items)
          draft[def.id] = suggestion(g.world, def, m, (draft[def.id] as ItemDecision).service);
        render();
      },
      true,
      { class: 'btn btn-secondary btn-small' },
    );

    const decTable = el(
      'div',
      { class: 'table-wrap' },
      el(
        'table',
        { class: 'sim-decisions' },
        el('caption', {}, fill(t.game.decCaption, { unit: unit() })),
        el(
          'thead',
          {},
          el(
            'tr',
            {},
            el('th', { scope: 'col' }, t.game.cols.item),
            el('th', { scope: 'col', class: 'num' }, t.game.cols.stock),
            el('th', { scope: 'col', class: 'num' }, t.game.cols.onOrder),
            ...[0, 1, 2].map((k) =>
              el(
                'th',
                { scope: 'col' },
                fill(t.game.cols.forecast, { month: monthName(m + k, false) }),
              ),
            ),
            el('th', { scope: 'col' }, t.game.cols.service),
            el('th', { scope: 'col', class: 'num' }, t.game.cols.ss),
            el('th', { scope: 'col', class: 'num' }, t.game.cols.rop),
            el('th', { scope: 'col' }, t.game.cols.qty),
          ),
        ),
        el('tbody', {}, ...rows),
      ),
    );

    wrap.append(
      header(g, monthLabel(m)),
      el(
        'h3',
        {},
        m === 0 ? t.game.startTitle : fill(t.game.pastTitle, { month: monthName(m - 1, false) }),
      ),
      ...past1,
      el('h3', {}, t.game.upcomingTitle),
      upcoming.length > 0
        ? el('ul', { class: 'sim-events' }, ...upcoming.map((e) => el('li', {}, eventText(e))))
        : el('p', {}, t.game.upcomingNone),
      el('h3', {}, t.game.planTitle),
      el('p', { class: 'field-hint' }, t.game.planHint),
      planBox,
      el('h3', {}, t.game.decisionsTitle),
      el('p', { class: 'field-hint' }, t.game.decisionsHint),
      decTable,
      el('div', { class: 'sim-actions' }, resetBtn),
      error,
      el('div', { class: 'sim-actions' }, launch, weekMode),
      footerActions(),
    );
    return wrap;
  }

  function footerActions(): HTMLElement {
    return el(
      'div',
      { class: 'sim-actions sim-secondary' },
      button(t.game.download, downloadSave, true),
      button(t.game.exportHistory, exportHistory, true),
      button(
        t.game.abandon,
        () => {
          if (!window.confirm(t.game.abandonConfirm)) return;
          clearStored();
          save = null;
          game = null;
          view = 'home';
          render();
        },
        true,
      ),
    );
  }

  function planTable(g: Game): HTMLElement {
    const plan = projectPlan(g, draft);
    const headRow = el(
      'tr',
      {},
      el('th', { scope: 'col' }, t.game.plan.family),
      el('th', { scope: 'col' }, t.game.plan.line),
      ...plan.months.map((mm) => el('th', { scope: 'col', class: 'num' }, monthName(mm))),
    );
    const body: HTMLElement[] = [];
    for (const fam of scenario.families) {
      const cells = plan.families[fam] ?? [];
      const lines: [string, (i: number) => string, (i: number) => string | undefined][] = [
        [t.game.plan.sales, (i) => nf0.format(cells[i]?.sales ?? 0), () => undefined],
        [t.game.plan.receipts, (i) => nf0.format(cells[i]?.receipts ?? 0), () => undefined],
        [
          t.game.plan.stockEnd,
          (i) => nf0.format(cells[i]?.stockEnd ?? 0),
          (i) => ((cells[i]?.stockEnd ?? 0) < 0 ? 'sim-neg' : undefined),
        ],
        [
          t.game.plan.cover,
          (i) => {
            const c = cells[i]?.cover;
            return c === null || c === undefined
              ? '—'
              : fill(t.game.plan.weeks, { n: nf1.format(c) });
          },
          () => undefined,
        ],
      ];
      lines.forEach(([label, value, cls], li) => {
        body.push(
          el(
            'tr',
            { class: li === 0 ? 'sim-group' : undefined },
            li === 0
              ? el('th', { scope: 'rowgroup', rowspan: 4 }, t.families[fam as keyof T['families']])
              : null,
            el('td', {}, label),
            ...plan.months.map((_, i) =>
              el('td', { class: ['num', cls(i)].filter(Boolean).join(' ') }, value(i)),
            ),
          ),
        );
      });
    }
    body.push(
      el(
        'tr',
        { class: 'sim-group' },
        el('th', { scope: 'row' }, t.game.plan.warehouse),
        el('td', {}, fill(t.game.plan.pallets, { cap: nf0.format(g.world.profile.warehouse) })),
        ...plan.pallets.map((p) =>
          el('td', { class: p > g.world.profile.warehouse ? 'num sim-neg' : 'num' }, nf0.format(p)),
        ),
      ),
    );
    return el(
      'div',
      { class: 'table-wrap' },
      el(
        'table',
        { class: 'sim-plan-table' },
        el('caption', {}, fill(t.game.plan.caption, { unit: unit() })),
        el('thead', {}, headRow),
        el('tbody', {}, ...body),
      ),
    );
  }

  // --- Écran 4 : semaine par semaine ---------------------------------------------------
  function renderWeek(g: Game): HTMLElement {
    const m = g.month;
    const k = g.week - monthStart(m);
    const wrap = el('section', { class: 'sim-play', 'aria-labelledby': 'sim-title' });
    const pending = (save?.forced ?? []).filter((f) => f.week === g.week);
    const rows = scenario.items.map((def) => {
      const st = g.player.items[def.id]!;
      const pol = g.player.policy[def.id];
      const onOrder = st.pipeline.reduce((s, l) => s + l.qty, 0);
      const next = [...st.pipeline].sort((a, b) => a.expected - b.expected)[0];
      const position = st.onHand + onOrder - st.backlog;
      return el(
        'tr',
        {},
        el('th', { scope: 'row' }, itemName(def.id)),
        el('td', { class: 'num' }, nf0.format(st.onHand)),
        el('td', { class: 'num' }, nf0.format(st.last.demand)),
        el('td', { class: st.last.short > 0 ? 'num sim-neg' : 'num' }, nf0.format(st.last.short)),
        el('td', { class: 'num' }, nf0.format(st.backlog)),
        el(
          'td',
          { class: 'num' },
          onOrder > 0 && next
            ? fill(t.week.arriving, {
                qty: nf0.format(onOrder),
                w: Math.min(TOTAL_WEEKS, next.expected + 1),
              })
            : '0',
        ),
        el('td', { class: 'num' }, nf0.format(position)),
        el('td', { class: 'num' }, nf0.format(pol?.rop ?? 0)),
      );
    });
    const table = el(
      'div',
      { class: 'table-wrap' },
      el(
        'table',
        {},
        el('caption', {}, fill(t.week.caption, { w: g.week, unit: unit() })),
        el(
          'thead',
          {},
          el(
            'tr',
            {},
            ...(
              [
                ['item', false],
                ['stock', true],
                ['demand', true],
                ['short', true],
                ['backlog', true],
                ['onOrder', true],
                ['position', true],
                ['rop', true],
              ] as const
            ).map(([key, n]) =>
              el('th', { scope: 'col', class: n ? 'num' : undefined }, t.week.cols[key]),
            ),
          ),
        ),
        el('tbody', {}, ...rows),
      ),
    );

    // Commande forcée
    const error = el('p', { class: 'error-text', role: 'alert' });
    const itemSel = el(
      'select',
      { id: 'sim-force-item' },
      ...scenario.items.map((d) => el('option', { value: d.id }, itemName(d.id))),
    );
    const qtyIn = el('input', {
      id: 'sim-force-qty',
      type: 'number',
      min: 1,
      max: LIMITS.qty,
      step: 1,
      value: '100',
      inputmode: 'numeric',
    });
    const mode = (value: string, label: string, checked: boolean) =>
      el(
        'label',
        {},
        el('input', { type: 'radio', name: 'sim-force-mode', value, checked }),
        label,
      );
    const order = button(t.week.order, () => {
      const n = Number(qtyIn.value);
      if (!save || !(Number.isInteger(n) && n >= 1 && n <= LIMITS.qty)) {
        error.textContent = t.week.invalid;
        return;
      }
      const express =
        (root.querySelector('input[name="sim-force-mode"]:checked') as HTMLInputElement | null)
          ?.value === 'express';
      save.forced = [...save.forced, { week: g.week, item: itemSel.value, qty: n, express }];
      persist();
      render();
    });
    const pendingList =
      pending.length > 0
        ? el(
            'ul',
            { class: 'sim-events' },
            ...pending.map((f) => {
              const cancel = button(
                t.week.cancel,
                () => {
                  if (!save) return;
                  save.forced = save.forced.filter((x) => x !== f);
                  persist();
                  render();
                },
                true,
                { class: 'btn btn-secondary btn-small' },
              );
              return el(
                'li',
                {},
                fill(f.express ? t.week.pendingExpress : t.week.pendingNormal, {
                  item: f.item,
                  qty: qty(f.qty),
                }),
                ' ',
                cancel,
              );
            }),
          )
        : null;

    const next = button(t.week.next, () => {
      if (!save) return;
      save.week = g.week + 1;
      persist();
      recompute();
      render();
    });
    const finish = button(
      t.week.finish,
      () => {
        if (!save) return;
        save.week = monthStart(m + 1);
        persist();
        recompute();
        render();
        scrollTop();
      },
      true,
    );

    wrap.append(
      header(
        g,
        fill(t.week.subtitle, {
          month: monthLabel(m),
          k,
          n: WEEKS_IN_MONTH[m] ?? 4,
        }),
      ),
      el('p', { class: 'field-hint' }, k === 1 ? t.week.startHint : t.week.hint),
      table,
      el('h3', {}, t.week.forceTitle),
      el(
        'div',
        { class: 'sim-force' },
        el(
          'div',
          { class: 'field' },
          el('label', { for: 'sim-force-item' }, t.week.forceItem),
          itemSel,
        ),
        el(
          'div',
          { class: 'field' },
          el('label', { for: 'sim-force-qty' }, fill(t.week.forceQty, { unit: unit() })),
          qtyIn,
        ),
        el(
          'fieldset',
          { class: 'radio-row sim-fieldset' },
          el('legend', { class: 'visually-hidden' }, t.week.modeLegend),
          mode('normal', fill(t.week.normal, { l: g.world.profile.leadWeeks }), true),
          mode('express', t.week.express, false),
        ),
        order,
      ),
      error,
      ...(pendingList ? [pendingList] : []),
      el('div', { class: 'sim-actions' }, next, finish),
      footerActions(),
    );
    return wrap;
  }

  // --- Graphiques (SVG, classes CSS, aucun attribut style) --------------------------------
  const SVG = 'http://www.w3.org/2000/svg';
  function svg(
    tag: string,
    attrs: Record<string, string | number>,
    ...children: (Node | string)[]
  ) {
    const n = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    for (const c of children) n.append(typeof c === 'string' ? document.createTextNode(c) : c);
    return n;
  }

  function lineChart(
    label: string,
    series: { name: string; cls: string; values: number[] }[],
    format: (n: number) => string,
    fromZero = true,
  ): SVGSVGElement {
    const W = 640;
    const H = 220;
    const L = 78;
    const R = 120;
    const T = 12;
    const B = 28;
    const n = Math.max(...series.map((s) => s.values.length));
    const all = series.flatMap((s) => s.values);
    let lo = fromZero ? Math.min(0, ...all) : Math.min(...all);
    let hi = Math.max(...all);
    if (hi === lo) hi = lo + 1;
    // Graduations « rondes » : pas de 1, 2, 2,5 ou 5 × 10ⁿ.
    const raw = (hi - lo) / 4;
    const pow = 10 ** Math.floor(Math.log10(raw));
    const f = raw / pow;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow;
    lo = Math.floor(lo / step) * step;
    hi = Math.ceil(hi / step) * step;
    const x = (i: number) => L + (n <= 1 ? 0 : (i / (n - 1)) * (W - L - R));
    const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
    const root = svg('svg', {
      viewBox: `0 0 ${W} ${H}`,
      class: 'sim-chart',
      role: 'img',
      'aria-label': label,
    }) as SVGSVGElement;
    for (let v = lo; v <= hi + step / 2; v += step) {
      root.append(
        svg('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'sim-grid' }),
        svg('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end', class: 'sim-axis' }, format(v)),
      );
    }
    for (let i = 0; i < n; i += n > 12 ? 3 : 1) {
      root.append(
        svg(
          'text',
          { x: x(i), y: H - 8, 'text-anchor': 'middle', class: 'sim-axis' },
          String(i + 1),
        ),
      );
    }
    const ends: { y: number; s: (typeof series)[number] }[] = [];
    for (const s of series) {
      if (s.values.length === 0) continue;
      const d = s.values
        .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
        .join(' ');
      root.append(svg('path', { d, class: `sim-line ${s.cls}` }));
      s.values.forEach((v, i) => {
        root.append(
          svg(
            'circle',
            { cx: x(i), cy: y(v), r: 3.5, class: `sim-dot ${s.cls}` },
            svg('title', {}, `${s.name} · ${fill(t.chart.month, { n: i + 1 })} : ${format(v)}`),
          ),
        );
      });
      ends.push({ y: y(s.values[s.values.length - 1] as number), s });
    }
    // Étiquettes directes en bout de courbe, écartées si elles se chevauchent.
    ends.sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) {
      const prev = ends[i - 1] as (typeof ends)[number];
      const cur = ends[i] as (typeof ends)[number];
      if (cur.y - prev.y < 14) cur.y = prev.y + 14;
    }
    for (const e of ends) {
      root.append(svg('text', { x: x(n - 1) + 8, y: e.y + 4, class: 'sim-end-label' }, e.s.name));
    }
    return root;
  }

  function legend(): HTMLElement {
    return el(
      'ul',
      { class: 'sim-legend' },
      el('li', {}, el('span', { class: 'sim-swatch sim-you', 'aria-hidden': 'true' }), t.you),
      el('li', {}, el('span', { class: 'sim-swatch sim-pilot', 'aria-hidden': 'true' }), t.pilot),
    );
  }

  function chartBlock(g: Game, kind: 'stock' | 'result' | 'fill'): Node[] {
    const pick = (c: Company) =>
      kind === 'stock'
        ? c.months.map((r) => r.stockValue)
        : kind === 'fill'
          ? c.months.map((r) => r.fillRate)
          : c.months.reduce<number[]>(
              (acc, r) => [...acc, (acc[acc.length - 1] ?? 0) + r.result],
              [],
            );
    const title = t.chart[kind];
    const format = kind === 'fill' ? (v: number) => pct.format(v) : (v: number) => money(v);
    return [
      el('h4', { class: 'sim-chart-title' }, title),
      lineChart(
        title,
        [
          { name: t.you, cls: 'sim-you', values: pick(g.player) },
          { name: t.pilot, cls: 'sim-pilot', values: pick(g.pilot) },
        ],
        format,
        kind !== 'fill',
      ),
      legend(),
    ];
  }

  // --- Écran 5 : bilan --------------------------------------------------------------------
  function renderEnd(g: Game): HTMLElement {
    const you = kpis(g.player, TOTAL_WEEKS);
    const pilot = kpis(g.pilot, TOTAL_WEEKS);
    const rows: [string, string, string, string][] = [
      [t.end.rows.result, money(you.result), money(pilot.result), money(you.result - pilot.result)],
      [t.end.rows.fillRate, pct.format(you.fillRate), pct.format(pilot.fillRate), ''],
      [t.end.rows.cycleRate, pct.format(you.cycleRate), pct.format(pilot.cycleRate), ''],
      [t.end.rows.avgStock, money(you.averageStock), money(pilot.averageStock), ''],
      [
        t.end.rows.turns,
        you.turns === null ? '—' : nf1.format(you.turns),
        pilot.turns === null ? '—' : nf1.format(pilot.turns),
        '',
      ],
      [
        t.end.rows.obsolete,
        money(g.player.totals.obsolescence),
        money(g.pilot.totals.obsolescence),
        '',
      ],
    ];
    const table = el(
      'div',
      { class: 'table-wrap' },
      el(
        'table',
        { class: 'sim-end-table' },
        el('caption', {}, t.end.caption),
        el(
          'thead',
          {},
          el(
            'tr',
            {},
            el('th', { scope: 'col' }, t.end.cols.indicator),
            el('th', { scope: 'col', class: 'num' }, t.you),
            el('th', { scope: 'col', class: 'num' }, t.pilot),
            el('th', { scope: 'col', class: 'num' }, t.end.cols.diff),
          ),
        ),
        el(
          'tbody',
          {},
          ...rows.map(([a, b, c, d]) =>
            el(
              'tr',
              {},
              el('th', { scope: 'row' }, a),
              el('td', { class: 'num' }, b),
              el('td', { class: 'num' }, c),
              el('td', { class: 'num' }, d),
            ),
          ),
        ),
      ),
    );
    const replay = button(
      t.end.replay,
      () => {
        if (!save) return;
        newSave({ ...save.config });
        scrollTop();
      },
      true,
    );
    const again = button(t.end.newGame, () => {
      setupState = newConfig('normal', randomSeed());
      view = 'setup';
      render();
    });
    return el(
      'section',
      { class: 'sim-play', 'aria-labelledby': 'sim-title' },
      el(
        'h2',
        { id: 'sim-title' },
        fill(t.end.title, {
          company: g.config.company || t.setup.companyDefault,
          seed: g.config.seed,
          profile:
            g.config.profileKey === 'custom'
              ? t.setup.custom
              : t.setup.profiles[g.config.profileKey],
        }),
      ),
      table,
      el('h3', {}, t.end.insightsTitle),
      el(
        'ul',
        {},
        ...insights(g, you.fillRate, pilot.fillRate, you.averageStock, pilot.averageStock).map(
          (s) => el('li', {}, s),
        ),
      ),
      ...chartBlock(g, 'result'),
      ...chartBlock(g, 'stock'),
      ...chartBlock(g, 'fill'),
      el(
        'div',
        { class: 'sim-actions' },
        button(t.game.download, downloadSave, true),
        button(t.game.exportHistory, exportHistory, true),
        replay,
        again,
      ),
    );
  }

  function insights(g: Game, fy: number, fp: number, sy: number, sp: number): string[] {
    const out: string[] = [];
    const items = Object.entries(g.player.items);
    const totalShort = items.reduce((s, [, st]) => s + st.cum.short, 0);
    if (totalShort > 0) {
      const [id, st] = items.sort((a, b) => b[1].cum.short - a[1].cum.short)[0] as [
        string,
        (typeof items)[number][1],
      ];
      out.push(
        fill(t.end.insightShort, {
          share: pct.format(st.cum.short / totalShort),
          item: itemName(id),
        }),
      );
    } else out.push(t.end.insightNoShort);
    const diff = sp > 0 ? (sy - sp) / sp : 0;
    out.push(
      fill(diff >= 0 ? t.end.insightStockHigher : t.end.insightStockLower, {
        diff: pct.format(Math.abs(diff)),
        you: pct.format(fy),
        pilot: pct.format(fp),
      }),
    );
    const eol = scenario.items.find((i) => i.endMonth !== undefined);
    if (eol) {
      const left = g.player.items[eol.id]?.onHand ?? 0;
      const pLeft = g.pilot.items[eol.id]?.onHand ?? 0;
      out.push(
        left > 0
          ? fill(t.end.insightObsolete, {
              item: itemName(eol.id),
              qty: qty(left),
              loss: money(g.player.totals.obsolescence),
              pilot: qty(pLeft),
            })
          : fill(t.end.insightObsoleteNone, { item: itemName(eol.id), pilot: qty(pLeft) }),
      );
    }
    return out;
  }

  // --- Export de l'historique au format de l'outil ------------------------------------------
  function exportHistory(): void {
    if (!game) return;
    const g = game;
    const fr = lang === 'fr';
    const sep = fr ? ';' : ',';
    const start = Date.UTC(2025, 0, 6); // lundi 6 janvier 2025 : début de l'historique
    const date = (k: number) => {
      const d = new Date(start + k * 7 * 86400000);
      const iso = d.toISOString().slice(0, 10);
      return fr ? iso.split('-').reverse().join('/') : iso;
    };
    const lines = [t.csv.header.split('|').join(sep)];
    for (const def of scenario.items) {
      const hist = g.world.history[def.id] as number[];
      const played = (g.world.demand[def.id] as number[]).slice(0, g.week);
      const price = fr ? String(def.unitCost).replace('.', ',') : String(def.unitCost);
      const label = (t.items[def.id as keyof T['items']] ?? def.id).replace(/[;,"]/g, ' ');
      [...hist, ...played].forEach((q, k) => {
        if (q > 0) lines.push([date(k), def.id, label, String(q), t.csv.sale, price].join(sep));
      });
    }
    downloadBlob(
      new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' }),
      t.csv.file,
    );
  }

  render();
}
