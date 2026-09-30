// Extra checks for the review fixes in cleanBodyText / extractBodyText
module.exports = (T, assert) => {
  // Forward header is skipped, forwarded content kept
  assert.strictEqual(
    T.cleanBodyText('Ciao\n\n-------- Messaggio Inoltrato --------\nOggetto: fattura 55'),
    'Ciao Oggetto: fattura 55');
  // Gmail attribution wrapped over two lines
  assert.strictEqual(
    T.cleanBodyText('Ok\nOn Mon, 1 Jan John Smith <\njohn@x.com> wrote:\n> old'),
    'Ok');
  // Italian reply header
  assert.strictEqual(T.cleanBodyText('Va bene\nIl giorno lun 1 gen, Mario ha scritto:\nvecchio'), 'Va bene');
  // Outlook separator
  assert.strictEqual(
    T.cleanBodyText('Ok\n________________________________\nFrom: X\nSent: Y'),
    'Ok');
  // Text attachment is not taken as body (falls back to HTML)
  const body = T.extractBodyText({ parts: [
    { contentType: 'text/html', body: '<p>x</p>' },
    { contentType: 'text/plain', name: 'a.csv', body: 'col1,col2' },
    { contentType: 'text/plain', headers: { 'content-disposition': ['attachment; filename=b.txt'] }, body: 'att' }
  ] });
  assert.ok(!body.includes('col1') && !body.includes('att'), body);
};
