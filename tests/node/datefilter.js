// R3-2 date filter checks
module.exports = async (T, E, browser, store, assert) => {
  const day = 24 * 3600 * 1000;
  const now = Date.now();

  // Settings: default, per account, global default inherited by new accounts
  assert.strictEqual((await E.getTrainingSettings('s1')).trainingMonths, 18);
  await E.saveTrainingSettings('s1', { trainingMonths: 6 });
  assert.strictEqual((await E.getTrainingSettings('s1')).trainingMonths, 6);
  assert.strictEqual((await E.getTrainingSettings('s2')).trainingMonths, 6, 'last value is the global default');
  await E.saveTrainingSettings('s2', { trainingMonths: 0 });
  assert.strictEqual((await E.getTrainingSettings('s2')).trainingMonths, 0);
  assert.strictEqual((await E.getTrainingSettings('s1')).trainingMonths, 6, 'per-account value kept');

  // Cutoff helpers
  assert.strictEqual(T.getTrainingCutoff(0), null);
  const cutoff = T.getTrainingCutoff(12, new Date(now));
  assert.ok(Math.abs((now - cutoff.getTime()) / day - 365.28) < 0.01);
  assert.ok(T.isOlderThanCutoff({ date: new Date(now - 400 * day) }, cutoff));
  assert.ok(!T.isOlderThanCutoff({ date: new Date(now - 300 * day) }, cutoff));
  assert.ok(!T.isOlderThanCutoff({ date: undefined }, cutoff), 'no date -> kept');
  assert.ok(!T.isOlderThanCutoff({ date: new Date(now - 4000 * day) }, null), 'no limit');

  // Training: old messages skipped, and their body is never fetched
  const msgs = { f1: [], f2: [] };
  for (let i = 0; i < 100; i++) {
    const old = i % 4 === 0;   // 25 old per folder
    const date = new Date(now - (old ? 900 : 30) * day);
    msgs.f1.push({ id: 9000 + i, headerMessageId: `<d${i}@a.it>`, date, author: 'A <a@a.it>', subject: `ordine ${i % 7} spedito` });
    msgs.f2.push({ id: 9500 + i, headerMessageId: `<e${i}@b.it>`, date, author: 'B <b@b.it>', subject: `riunione ${i % 5} progetto` });
  }
  const fetched = [];
  browser.folders.query = async () => [{ id: 'f1', path: '/Ordini' }, { id: 'f2', path: '/Lavoro' }];
  browser.folders.getFolderInfo = async () => ({ totalMessageCount: 100 });
  browser.messages.list = async id => ({ messages: msgs[id] });
  browser.messages.getFull = async id => { fetched.push(id); return { parts: [{ contentType: 'text/plain', body: 'testo' }] }; };

  const res = await E.trainModel({ id: 'a5' }, ['/Ordini', '/Lavoro'], 'naive_bayes', { trainingMonths: 18 });
  assert.strictEqual(res.messagesProcessed, 150);
  assert.strictEqual(res.messagesSkipped, 50);
  assert.strictEqual(fetched.length, 150, 'no body fetched for old messages');
  const meta = await E.getModelMeta('a5', 'naive_bayes');
  assert.strictEqual(meta.trainingMonths, 18);
  assert.strictEqual(meta.messagesSkipped, 50);
  assert.ok(meta.cutoffDate);
  assert.ok(E.evaluationToMarkdown(meta, 'x').includes('- Date filter: last 18 months (since'));

  const all = await E.trainModel({ id: 'a5' }, ['/Ordini', '/Lavoro'], 'naive_bayes', { trainingMonths: 0, includeBody: false });
  assert.strictEqual(all.messagesProcessed, 200);
  assert.strictEqual(all.messagesSkipped, 0);
  assert.ok(E.evaluationToMarkdown(await E.getModelMeta('a5', 'naive_bayes'), 'x').includes('- Date filter: none (all messages)'));

  // Everything too old -> clear error
  browser.messages.list = async id => ({ messages: msgs[id].filter((m, i) => i % 4 === 0) });
  await assert.rejects(E.trainModel({ id: 'a5' }, ['/Ordini', '/Lavoro'], 'naive_bayes', { trainingMonths: 18, includeBody: false }),
    /No messages newer than 18 months \(50 older messages skipped\)/);
};
