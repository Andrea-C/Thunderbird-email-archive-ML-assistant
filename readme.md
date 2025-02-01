# Email Archive ML Assistant

L'obiettivo di questa applicazione, che si usa come estensione di Mozilla Thunderbird, è di aiutare l'utente nella archviazione dei messaggi presenti nella posta in entrata nella varie cartelle di archivio.
Per fare questo, l'appicazione studia come sono stati archiviati i messaggi precendenti, crea un modello di Machine Learning leggendo il contenuto delle cartelle di archivio, e utilizza questo modello per suggerire, in fase di archiviazione di un nuovo messaggio, in quale cartella inserire il nuovo messaggio.

L'applicazione è stata sviluppata come esercizio per verificare la possibilità di scrivere un'applicazione funzionante, con questi vincoli: 
- il codice deve essere scritto interamente dall'Intelligenza Artificiale
- il codice deve essere utilizzare funzioni e API che non fa parte del training dei modelli AI utilizzati

## Requisiti:
- L'applicazione deve essere completamente integrata in Mozillla Thunderbird
- Anche il salvataggi di dati interni all'applicazione deve essere gestito tramite le API storage di Thunderbird
- per tutte le fasi, l'applicazione esegue la sincronizzazione IMAP con il server di posta

L'applicazione è divisa in due parti:
- Training: dove si crea il modello di Machine Learning
- Archive: dove si utilizza il modello per suggerire la cartella di archivio e archiviare il messaggio

### Training
- L'applicazione recupera gli account di posta elettronica presenti nel client Thunderbird
- Per ogni account, l'applicazione recupera tutte le cartelle di archivio presenti, distinguendo tra cartelle di sistema (Inbox, Sent, Drafts, Trash, Junk, ...) e cartelle di archivio personali.
- L'utente selezione la mailbox da allenare
- L'applicazione presenta l'elenco delle cartelle su cui basare il modello di Machine Learning, selezionando automaticamente tutte le cartelle di personali ed escludendo le cartelle di sistema
- Permette all'utente di cambiare la selezione iniziale
- La selezione delle cartelle viene memorizzata nello storage interno
- Viene creato un modello di Machine Learning per ogni mailbox selezionata
- È possibile eliminare il modello di Machine Learning e ricrearlo

### Archive
- L'applicazione permette di selezionare la mailbox da utilizzare per l'archiviazione, selezionando tra le mailbox per cui è stato creato un modello di Machine Learning
- L'utente selezione una soglia di probabilità, al di sopra della quale un messaggio verrà suggerito per l'archiviazione
- Vengono mostrati tutti i messaggi presenti nella Inbox della casella selezionata
- L'utente può selezionare tutti o alcuni dei messaggi da classificare: assegnazione di una cartella di archivio con indicazione della confidenzialità della classificazione
- L'utente può selezionare i messaggi da archiviare
- I messaggi selezionati vengono spostati dalla Inbox alla cartella di archivio determinata dal modello di Machine Learning







