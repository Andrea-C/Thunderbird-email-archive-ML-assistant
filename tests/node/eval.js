// R3-5 evaluation checks
module.exports = async (T, E, browser, store, assert) => {
  // Deterministic split, ~20% held out, keyed on headerMessageId
  const ids = Array.from({ length: 5000 }, (_, i) => `<msg${i}@example.com>`);
  const held = ids.filter(id => T.isHoldOutMessage({ headerMessageId: id, id: 1 }, '/X'));
  assert.ok(held.length > 900 && held.length < 1100, `holdout share ${held.length}/5000`);
  assert.strictEqual(T.isHoldOutMessage({ headerMessageId: ids[7], id: 1 }, '/A'),
    T.isHoldOutMessage({ headerMessageId: ids[7], id: 999 }, '/B'), 'same Message-ID -> same side');

  // Metrics on a hand-computed example
  const results = [
    { actual: '/A', predicted: '/A', confidence: 95 },
    { actual: '/A', predicted: '/A', confidence: 85 },
    { actual: '/A', predicted: '/B', confidence: 90 },
    { actual: '/B', predicted: '/B', confidence: 60 },
    { actual: '/C', predicted: '/A', confidence: 40 }
  ];
  const r = T.computeEvaluation(results, { '/A': 10, '/B': 4, '/C': 1 });
  assert.strictEqual(r.testSize, 5);
  assert.strictEqual(r.trainSize, 15);
  assert.strictEqual(r.accuracy, 3 / 5);
  const byFolder = Object.fromEntries(r.perFolder.map(f => [f.folder, f]));
  assert.strictEqual(byFolder['/A'].precision, 2 / 3);   // predicted A 3 times, 2 right
  assert.strictEqual(byFolder['/A'].recall, 2 / 3);
  assert.strictEqual(byFolder['/B'].precision, 1 / 2);
  assert.strictEqual(byFolder['/B'].recall, 1);
  assert.strictEqual(byFolder['/C'].recall, 0);
  assert.strictEqual(byFolder['/C'].precision, null);    // never predicted
  assert.ok(byFolder['/C'].insufficient);
  const r0 = T.computeEvaluation([{ actual: '/A', predicted: '/A', confidence: 90 }], { '/A': 5, '/Tiny': 2 });
  assert.ok(r0.perFolder.some(f => f.folder === '/Tiny' && f.support === 0 && f.insufficient), 'trained folder without test messages listed');
  const f1A = 2 / 3, f1B = 2 * 0.5 * 1 / 1.5;
  assert.ok(Math.abs(r.macroF1 - (f1A + f1B + 0) / 3) < 1e-12);
  const t80 = r.thresholds.find(t => t.threshold === 80);
  assert.strictEqual(t80.count, 3);
  assert.strictEqual(t80.coverage, 3 / 5);
  assert.strictEqual(t80.precision, 2 / 3);
  assert.strictEqual(r.thresholds.find(t => t.threshold === 95).precision, 1);
  assert.deepStrictEqual(r.topConfusions.map(c => [c.actual, c.predicted, c.count]).sort(),
    [['/A', '/B', 1], ['/C', '/A', 1]]);

  const md = E.evaluationToMarkdown({ algorithmType: 'tfidf_naive_bayes', features: 'headers', messagesUsed: 15, evaluation: r }, 'Acc|Name');
  assert.ok(md.includes('**Accuracy: 60.0%**') && md.includes('Acc\\|Name') && md.includes('| ≥ 80% ◀ | 60.0% | 3 | 66.7% |'), md);
  assert.ok(E.evaluationToMarkdown({}).startsWith('No evaluation report'));

  // End to end: train on a synthetic account and get a stored report
  const folderMsgs = { f1: [], f2: [] };
  for (let i = 0; i < 200; i++) {
    folderMsgs.f1.push({ id: 1000 + i, headerMessageId: `<o${i}@shop.it>`, author: 'Shop <orders@shop.it>', subject: `Il tuo ordine spedito ${i}` });
    folderMsgs.f2.push({ id: 2000 + i, headerMessageId: `<w${i}@acme.it>`, author: 'Boss <boss@acme.it>', subject: `Riunione progetto ${i}` });
  }
  browser.folders.query = async () => [{ id: 'f1', path: '/Ordini' }, { id: 'f2', path: '/Lavoro' }];
  browser.folders.getFolderInfo = async () => ({ totalMessageCount: 200 });
  browser.messages.list = async id => ({ messages: folderMsgs[id] });
  const res = await E.trainModel({ id: 'a3' }, ['/Ordini', '/Lavoro'], 'tfidf_naive_bayes', { includeBody: false });
  assert.ok(res.evaluation, 'evaluation returned');
  assert.strictEqual(res.evaluation.testSize + res.evaluation.trainSize, 400);
  assert.strictEqual(res.evaluation.accuracy, 1);
  const meta = await E.getModelMeta('a3', 'tfidf_naive_bayes');
  assert.strictEqual(meta.evaluation.testSize, res.evaluation.testSize);
  assert.strictEqual(meta.messagesUsed, 400, 'production model uses 100%');
  assert.strictEqual(meta.algorithmType, 'tfidf_naive_bayes');

  // Same data -> same split -> same test size (determinism across runs)
  const res2 = await E.trainModel({ id: 'a3' }, ['/Ordini', '/Lavoro'], 'svm', { includeBody: false });
  assert.strictEqual(res2.evaluation.testSize, res.evaluation.testSize);
};
