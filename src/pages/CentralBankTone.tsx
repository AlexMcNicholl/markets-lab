import { useMemo } from "react";
import {
  Bank,
  BANK_NAME,
  getStatement,
  scoreStatement,
  STATEMENTS,
  toneLabel,
} from "../lib/centralbank";
import { signed, signClass } from "../lib/format";
import { useSharedState } from "../lib/useSharedState";
import ToolPage from "../components/ToolPage";
import ToneChart from "../components/ToneChart";
import CopyLinkButton from "../components/CopyLinkButton";

interface State {
  bank: Bank;
  stmt: string;
}

const DEFAULT_STATE: State = { bank: "boc", stmt: "boc-2022-03" };

export default function CentralBankTone() {
  const [state, setState] = useSharedState<State>(DEFAULT_STATE);
  const bank = state.bank;
  const statements = STATEMENTS[bank];

  // Guard against a stale URL pointing at a statement from the other bank.
  const active =
    getStatement(state.stmt)?.bank === bank
      ? getStatement(state.stmt)!
      : statements[0];

  const score = useMemo(() => scoreStatement(active.text), [active]);

  // Tone index for every meeting in this bank, for the timeline chart.
  const points = useMemo(
    () =>
      statements.map((s) => ({
        id: s.id,
        date: s.date,
        index: scoreStatement(s.text).index,
      })),
    [statements],
  );

  const leader = score.hits[0];
  const tone = toneLabel(score.index);

  const selectBank = (b: Bank) =>
    setState({ bank: b, stmt: STATEMENTS[b][0].id });

  return (
    <ToolPage
      slug="central-bank-tone"
      actions={<CopyLinkButton />}
      lede={
        <>
          Score a real central-bank rate statement on a hawkish-to-dovish scale
          with a transparent term lexicon — no model, no black box. Pick a
          meeting below and watch the bank's own words split into the case for{" "}
          <em>tighter</em> policy and the case for <em>easier</em> policy, then
          track how the tone turns across the cycle.
        </>
      }
    >
      <div className="toolbar">
        <div className="scenario-row">
          <span className="toolbar-label">Bank</span>
          {(Object.keys(BANK_NAME) as Bank[]).map((b) => (
            <button
              key={b}
              className={`preset${bank === b ? " active" : ""}`}
              onClick={() => selectBank(b)}
            >
              {BANK_NAME[b]}
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar" style={{ marginTop: 12 }}>
        <div className="scenario-row">
          <span className="toolbar-label">Statement</span>
          {statements.map((s) => (
            <button
              key={s.id}
              className={`preset${active.id === s.id ? " active" : ""}`}
              title={s.descriptor}
              onClick={() => setState({ bank, stmt: s.id })}
            >
              {s.date}
            </button>
          ))}
        </div>
      </div>

      <div className="stats hero-stats">
        <div className="stat">
          <div className="k">Hawkish score</div>
          <div className="v pos">{score.hawkish}</div>
        </div>
        <div className="stat">
          <div className="k">Dovish score</div>
          <div className="v neg">{score.dovish}</div>
        </div>
        <div className="stat">
          <div className="k">Net tone</div>
          <div className={`v ${signClass(score.index)}`}>
            {signed(score.index, 0)}
          </div>
        </div>
      </div>

      <div className="verdict">
        The <strong>{active.date}</strong> {BANK_NAME[bank]} statement —{" "}
        {active.descriptor.toLowerCase()}, rate to {active.rate} — reads{" "}
        <strong className={signClass(score.index)}>{tone}</strong>
        {leader ? (
          <>
            , driven most by{" "}
            <strong className={signClass(leader.contribution)}>
              "{leader.phrase}"
            </strong>
          </>
        ) : null}
        .
      </div>

      <div className="output" style={{ border: "1px solid var(--rule)", marginTop: 0 }}>
        <h4>Tone across {BANK_NAME[bank]} statements</h4>
        <ToneChart
          points={points}
          selected={active.id}
          onSelect={(id) => setState({ bank, stmt: id })}
        />

        <h4 style={{ marginTop: 28 }}>The statement, scored</h4>
        <p className="statement-quote">
          {score.segments.map((seg, i) =>
            seg.stance ? (
              <mark key={i} className={`tone-${seg.stance}`}>
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>

        <table className="data" style={{ marginTop: 22 }}>
          <thead>
            <tr>
              <th>Term</th>
              <th>Stance</th>
              <th className="num">Hits</th>
              <th className="num">Weight</th>
              <th className="num">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {score.hits.map((h) => (
              <tr
                key={h.phrase}
                className={h.phrase === leader?.phrase ? "is-leader" : undefined}
              >
                <td>"{h.phrase}"</td>
                <td className={h.stance === "hawkish" ? "pos" : "neg"}>
                  {h.stance}
                </td>
                <td className="num">{h.count}</td>
                <td className="num">{h.weight}</td>
                <td className={`num ${signClass(h.contribution)}`}>
                  {signed(h.contribution, 0)}
                </td>
              </tr>
            ))}
            <tr className="total">
              <td>Net</td>
              <td />
              <td className="num" />
              <td className="num" />
              <td className={`num ${signClass(score.net)}`}>
                {signed(score.net, 0)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          Net = hawkish − dovish weighted hits ({score.hawkish} − {score.dovish}).
          The tone index rescales it to ±100: net ÷ total hits ×100 ={" "}
          {signed(score.index, 0)}.
        </p>
      </div>

      <div className="prose">
        <h3>How it's scored</h3>
        <p>
          Each statement is matched against a fixed lexicon of monetary-policy
          terms, every one tagged hawkish or dovish and given a weight from 1 (a
          mild lean) to 3 (an explicit policy signal like{" "}
          <code>raise the target range</code>). Phrases are matched
          longest-first and each word is counted once, so a specific phrase and
          the bare word inside it never double-count. The net tone is then
          rescaled to a bounded index so statements of different lengths compare:
        </p>
        <div className="formula">
          tone = (hawkish − dovish) ÷ (hawkish + dovish) × 100
        </div>
        <p>
          The whole dictionary is on the page — this is the same transparent
          lexicon approach used as the baseline in central-bank communication
          research (Apel &amp; Blix Grimaldi) and financial-text sentiment
          (Loughran-McDonald), and the yardstick that LLM tone classifiers are
          measured against.
        </p>

        <h3>What a word count can't see</h3>
        <p>
          A bag of words is honest but context-blind. "The unemployment rate has{" "}
          <em>declined</em>" scores dovish here, even though falling unemployment
          is really a sign of a hot economy a hawk would worry about; negations
          and forward guidance ("we do <em>not</em> expect to cut") slip through
          too. That gap is exactly where a language model earns its keep —
          reading the sentence, not just the term — but it trades this page's
          full transparency for a judgement you have to trust. The lexicon is the
          baseline you grade that model against.
        </p>
      </div>
    </ToolPage>
  );
}
