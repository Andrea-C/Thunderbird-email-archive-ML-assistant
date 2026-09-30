// Confidence calibration checks
module.exports = async (T, E, browser, store, assert) => {
  // AUC: perfect, useless, ties
  assert.strictEqual(T.computeAuc([{ score: 1, correct: false }, { score: 2, correct: true }]), 1);
  assert.strictEqual(T.computeAuc([{ score: 2, correct: false }, { score: 1, correct: true }]), 0);
  assert.strictEqual(T.computeAuc([{ score: 1, correct: false }, { score: 1, correct: true }]), 0.5);
  assert.strictEqual(T.computeAuc([{ score: 1, correct: true }]), null);

  // Isotonic fit is monotone and tracks the observed rate
  const items = [];
  for (let i = 0; i < 1000; i++) {
    const score = i / 100;                       // 0..10
    items.push({ score, correct: (i * 7919) % 100 < score * 10 });  // P(correct) ~ score/10
  }
  const iso = T.fitIsotonic(items);
  for (let i = 1; i < iso.y.length; i++) assert.ok(iso.y[i] >= iso.y[i - 1], 'monotone');
  const cal = { score: 'margin', x: iso.x, y: iso.y };
  const low = T.calibrateConfidence(cal, { margin: 0.5, confidence: 99 });
  const high = T.calibrateConfidence(cal, { margin: 9.5, confidence: 99 });
  assert.ok(low < 20 && high > 80, `calibrated low=${low} high=${high}`);
  assert.strictEqual(T.calibrateConfidence(cal, { margin: -5, confidence: 99 }), Math.round(iso.y[0] * 100), 'below first knot');
  assert.strictEqual(T.calibrateConfidence(null, { margin: 3, confidence: 97 }), 97, 'no calibration -> raw');

  // fitConfidenceCalibration picks the score with the best AUC
  const results = [];
  for (let i = 0; i < 400; i++) {
    const tokenCount = 1 + (i % 50);
    const perToken = (i % 10) / 10;              // informative only per token
    const correct = Math.floor(i * 7919 / 13) % 10 < (i % 10);
    results.push({ margin: perToken * tokenCount, tokenCount, actual: '/A', predicted: correct ? '/A' : '/B' });
  }
  const fitted = T.fitConfidenceCalibration(results);
  assert.strictEqual(fitted.score, 'marginPerToken');
  assert.ok(fitted.auc > 0.8, `auc ${fitted.auc}`);
  assert.strictEqual(T.fitConfidenceCalibration(results.slice(0, 10)), null, 'too few samples');

  // End to end: ambiguous synthetic data -> errors -> calibration stored and used
  const folderMsgs = { f1: [], f2: [] };
  for (let i = 0; i < 600; i++) {
    const shared = i % 3 === 0;   // a third of messages use the other folder's words
    folderMsgs.f1.push({ id: 5000 + i, headerMessageId: `<p${i}@x.it>`, author: `S${i % 40} <s${i % 40}@z.it>`,
      subject: shared ? `riunione progetto ${i % 17}` : `ordine spedito pacco ${i % 13}` });
    folderMsgs.f2.push({ id: 7000 + i, headerMessageId: `<q${i}@y.it>`, author: `S${(i + 7) % 40} <s${(i + 7) % 40}@z.it>`,
      subject: shared ? `ordine spedito pacco ${i % 11}` : `riunione progetto verbale ${i % 19}` });
  }
  browser.folders.query = async () => [{ id: 'f1', path: '/Ordini' }, { id: 'f2', path: '/Lavoro' }];
  browser.folders.getFolderInfo = async () => ({ totalMessageCount: 600 });
  browser.messages.list = async id => ({ messages: folderMsgs[id] });
  const res = await E.trainModel({ id: 'a4' }, ['/Ordini', '/Lavoro'], 'tfidf_naive_bayes', { includeBody: false });
  const ev = res.evaluation;
  assert.ok(ev.accuracy < 1 && ev.accuracy > 0.5, `accuracy ${ev.accuracy}`);
  assert.ok(ev.calibration, 'calibration fitted');
  assert.ok(ev.thresholdSampleSize > 0 && ev.thresholdSampleSize < ev.testSize, 'thresholds on report half only');
  const meta = await E.getModelMeta('a4', 'tfidf_naive_bayes');
  assert.ok(meta.calibration && meta.calibration.x.length === meta.calibration.y.length);
  const md = E.evaluationToMarkdown(meta, 'x');
  assert.ok(md.includes('Confidence: calibrated'), md.slice(0, 600));
  const p = await E.classifyMessage({ id: 1, author: 'P1 <p1@x.it>', subject: 'ordine spedito pacco 3' }, 'a4', 'tfidf_naive_bayes');
  assert.ok(typeof p.rawConfidence === 'number' && p.confidence >= 0 && p.confidence <= 100);
  console.log(`  e2e: accuracy ${(ev.accuracy * 100).toFixed(1)}%, score ${ev.calibration.score}, AUC ${ev.calibration.auc}, ` +
    `thresholds ${ev.thresholds.map(t => `${t.threshold}:${(t.coverage * 100).toFixed(0)}%/${t.precision === null ? '-' : (t.precision * 100).toFixed(0) + '%'}`).join(' ')}`);
};
