// Folder selection persistence checks
module.exports = async (E, browser, store, assert) => {
  const tree = [{ path: '/Inbox', name: 'Inbox', type: 'inbox' },
    { path: '/Ordini', name: 'Ordini', subFolders: [{ path: '/Ordini/Vecchio', name: 'Vecchio' }] },
    { path: '/Lavoro', name: 'Lavoro' }];
  browser.accounts = { get: async () => ({ folders: tree }) };
  const state = async () => Object.fromEntries((await E.getFoldersWithState({ id: 'a2' })).map(f => [f.path, f.selected]));

  // Never saved: defaults (system folder unchecked, others checked)
  assert.deepStrictEqual(await state(), { '/Inbox': false, '/Ordini': true, '/Ordini/Vecchio': true, '/Lavoro': true });

  // Legacy rel-2 format written by trainModel: list of trained paths -> others unchecked
  store.folders_a2 = JSON.stringify(['/Ordini', '/Lavoro']);
  assert.deepStrictEqual(await state(), { '/Inbox': false, '/Ordini': true, '/Ordini/Vecchio': false, '/Lavoro': true });

  // New format: user unchecks a deprecated folder, full tree saved
  await E.saveFolderStructure('a2', [{ path: '/Inbox', selected: false }, { path: '/Ordini', selected: true },
    { path: '/Ordini/Vecchio', selected: false }, { path: '/Lavoro', selected: true }]);
  // Training must not touch the selection
  await E.trainModel({ id: 'a2' }, ['/Ordini', '/Lavoro'], 'naive_bayes', { includeBody: false });
  assert.deepStrictEqual(await state(), { '/Inbox': false, '/Ordini': true, '/Ordini/Vecchio': false, '/Lavoro': true });

  // A folder created later gets the default, saved choices unchanged
  tree.push({ path: '/Nuovo', name: 'Nuovo' });
  assert.deepStrictEqual(await state(), { '/Inbox': false, '/Ordini': true, '/Ordini/Vecchio': false, '/Lavoro': true, '/Nuovo': true });

  // Archive/Review target list keeps selected folders only
  const saved = await E.getSavedFolders('a2');
  assert.deepStrictEqual(saved.filter(f => f.selected !== false).map(f => f.path).sort(), ['/Lavoro', '/Ordini']);
};
