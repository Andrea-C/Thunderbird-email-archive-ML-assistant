## Evaluation report — andrea.clementi@yahoo.it

- Algorithm: tfidf_naive_bayes · features: headers+body
- Trained: 2026-09-26T10:32:58.166Z · messages: 21582
- Hold-out: 20% → 4338 test messages, evaluation model trained on 17244
- **Accuracy: 77.6%** · macro-F1: 45.3%

### Confidence threshold

| Threshold | Coverage | Messages | Precision above threshold |
|---:|---:|---:|---:|
| ≥ 50% | 100.0% | 4336 | 77.7% |
| ≥ 60% | 99.7% | 4325 | 77.8% |
| ≥ 70% | 99.5% | 4318 | 78.0% |
| ≥ 80% ◀ | 99.3% | 4306 | 78.1% |
| ≥ 90% | 98.8% | 4285 | 78.3% |
| ≥ 95% | 98.5% | 4271 | 78.5% |

### Top confusions (actual → predicted)

| Actual folder | Predicted folder | Count |
|---|---|---:|
| /_Notifiche | /_Accounts | 48 |
| /Commercialista | /_z Evridiky/Commercialista | 30 |
| /_News | /_Accounts | 29 |
| /RichiesteAssistenza | /_Accounts | 20 |
| /_z Evridiky/Nota spese/2026 | /_AcquistiOnLine | 18 |
| /_News | /Formazione | 16 |
| /_z Evridiky/Clienti/Max Mara | /_z Evridiky/Commercialista | 16 |
| /_Accounts | /Formazione | 15 |
| /_AcquistiOnLine | /_Accounts | 13 |
| /_z Evridiky/Nota spese/2025 | /_AcquistiOnLine | 13 |
| /_News | /_Notifiche | 12 |
| /Postadmz | /_News | 12 |
| /_Accounts | /_News | 11 |
| /_Famiglia/Alexandro/Medicina | /Medicina | 11 |
| /_Notifiche | /Progetti/FeedbackLoop | 11 |
| /Casa/Collaboratori | /_z Evridiky/Commercialista | 11 |
| /Documentazione | /_Famiglia/Vicky | 11 |
| /Aruba | /andreaclementi.it | 10 |
| /Progetti/5VIE | /_News | 10 |
| /Progetti/FeedbackLoop | /_Notifiche | 10 |

### Per folder (⚠ = fewer than 5 test messages)

| Folder | Train | Test | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| /_News | 2278 | 590 | 85.8% | 87.1% | 86.5% |
| /_Accounts | 1525 | 346 | 54.8% | 84.7% | 66.5% |
| /_AcquistiOnLine | 980 | 284 | 82.2% | 90.8% | 86.3% |
| /_z Evridiky/Commercialista | 1113 | 277 | 72.3% | 95.3% | 82.2% |
| /_Notifiche | 963 | 238 | 75.6% | 68.9% | 72.1% |
| /BancheAssicurazioni | 745 | 177 | 74.4% | 95.5% | 83.7% |
| /Formazione | 575 | 168 | 66.5% | 99.4% | 79.7% |
| /_z Evridiky/Fatture - notifiche | 586 | 149 | 100.0% | 100.0% | 100.0% |
| /Trenitalia | 546 | 135 | 97.7% | 96.3% | 97.0% |
| /_Famiglia/Vicky | 432 | 110 | 78.7% | 90.9% | 84.4% |
| /Progetti/ICS Diaz | 355 | 107 | 81.7% | 87.9% | 84.7% |
| /Progetti/Evridigit/Notifiche | 397 | 95 | 86.3% | 92.6% | 89.3% |
| /_Famiglia/Alexandro | 432 | 94 | 70.9% | 95.7% | 81.4% |
| /Progetti/5VIE | 306 | 83 | 85.7% | 65.1% | 74.0% |
| /Amici | 359 | 82 | 81.0% | 62.2% | 70.3% |
| /_z Evridiky/Commercialista circolari | 374 | 79 | 91.6% | 96.2% | 93.8% |
| /Viaggi - Compagnie aeree | 297 | 72 | 95.3% | 84.7% | 89.7% |
| /andreaclementi.it | 283 | 66 | 77.2% | 92.4% | 84.1% |
| /Progetti/FeedbackLoop | 230 | 66 | 74.5% | 57.6% | 65.0% |
| /Casa/Lanzone40/Condominio | 265 | 64 | 78.2% | 95.3% | 85.9% |
| /Casa/Lanzone40 | 239 | 56 | 67.2% | 80.4% | 73.2% |
| /Medicina | 218 | 54 | 69.6% | 88.9% | 78.0% |
| /_z Evridiky/Evridiky PEC | 185 | 47 | 73.7% | 89.4% | 80.8% |
| /Casa/Collaboratori | 213 | 47 | 81.6% | 66.0% | 72.9% |
| /RichiesteAssistenza | 125 | 44 | 92.3% | 27.3% | 42.1% |
| /Postadmz | 151 | 43 | 100.0% | 46.5% | 63.5% |
| /_z Evridiky/Nota spese/2025 | 151 | 38 | 70.8% | 44.7% | 54.8% |
| /Commercialista | 150 | 37 | – | 0.0% | 0.0% |
| /Documentazione | 104 | 36 | 100.0% | 5.6% | 10.5% |
| /_Famiglia/Stefano/Attivita | 152 | 33 | 94.7% | 54.5% | 69.2% |
| /Progetti/Evridigit/Archivio messaggi | 103 | 31 | 85.7% | 19.4% | 31.6% |
| /_Famiglia/Alexandro/Liceo A.Volta | 112 | 30 | 80.8% | 70.0% | 75.0% |
| /_Famiglia/Parenti | 171 | 30 | 83.3% | 50.0% | 62.5% |
| /_z Evridiky/Nota spese/2026 | 113 | 30 | 66.7% | 6.7% | 12.1% |
| /_z Evridiky/Telepass | 108 | 29 | 100.0% | 96.6% | 98.2% |
| /_Famiglia/Stefano/Medicina | 100 | 28 | 66.7% | 42.9% | 52.2% |
| /_z Evridiky/Clienti/Max Mara | 108 | 28 | 91.7% | 39.3% | 55.0% |
| /_Famiglia/Stefano | 144 | 27 | 95.0% | 70.4% | 80.9% |
| /Casa/Lanzone40/Elettrodomestici e mobili | 110 | 27 | 86.4% | 70.4% | 77.6% |
| /Junk | 121 | 25 | 100.0% | 28.0% | 43.8% |
| /Aruba | 74 | 22 | 90.9% | 45.5% | 60.6% |
| /Lavoro - Ricerca | 88 | 22 | 94.4% | 77.3% | 85.0% |
| /Casa | 46 | 20 | 100.0% | 55.0% | 71.0% |
| /Progetti/Evridigit/Contabilita | 49 | 17 | 70.0% | 41.2% | 51.9% |
| /_z Evridiky/Fornitori | 87 | 16 | 100.0% | 37.5% | 54.5% |
| /_z Evridiky/Fornitori/Arval | 84 | 15 | 73.3% | 73.3% | 73.3% |
| /_Famiglia/Alexandro/Medicina | 31 | 14 | 100.0% | 14.3% | 25.0% |
| /_z Evridiky/Vari | 56 | 13 | 100.0% | 15.4% | 26.7% |
| /Casa/Lanzone40/Utenze/Vodafone | 66 | 13 | 100.0% | 76.9% | 87.0% |
| /PA/Altre | 38 | 11 | 100.0% | 18.2% | 30.8% |
| /_Famiglia/Alexandro/Notifiche Alex | 31 | 10 | 87.5% | 70.0% | 77.8% |
| /Progetti/Romboli e Associati | 23 | 10 | 100.0% | 50.0% | 66.7% |
| /Progetti/5VIE/Rapisardi | 30 | 8 | 57.1% | 50.0% | 53.3% |
| /Progetti/Evridigit/Registrazioni | 21 | 8 | – | 0.0% | 0.0% |
| /Amici/Amici_Lavoro | 37 | 7 | 100.0% | 14.3% | 25.0% |
| /Amici/Amici_Renzo | 28 | 7 | 100.0% | 42.9% | 60.0% |
| /Andrea_Vicky | 38 | 7 | 0.0% | 0.0% | 0.0% |
| /PA/ATM | 32 | 7 | 100.0% | 28.6% | 44.4% |
| /Progetti/5VIE/5vie.milano.it | 21 | 7 | 100.0% | 14.3% | 25.0% |
| /Amici/ISEF | 15 | 6 | 100.0% | 33.3% | 50.0% |
| /Casa/Rimini | 23 | 6 | – | 0.0% | 0.0% |
| /Commercialista/Dichiarazione x 2025 | 22 | 6 | – | 0.0% | 0.0% |
| /Progetti/Evridigit | 14 | 6 | – | 0.0% | 0.0% |
| /_z Evridiky/Fornitori/ShareNow Car2Go | 6 | 5 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Amministratore | 40 | 5 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze/Fastweb | 21 | 5 | 100.0% | 20.0% | 33.3% |
| /PA/Comune-Milano | 31 | 5 | 100.0% | 20.0% | 33.3% |
| /Progetti/SDE Social Digital Education | 15 | 5 | – | 0.0% | 0.0% |
| /_z Evridiky/Clienti/Ipekyol ⚠ | 10 | 4 | 100.0% | 25.0% | 40.0% |
| /_z Evridiky/Ricerca ⚠ | 11 | 4 | 100.0% | 25.0% | 40.0% |
| /Evridiky ⚠ | 19 | 4 | – | 0.0% | 0.0% |
| /Progetti/5VIE/Rapisardi tutte ⚠ | 23 | 4 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze ⚠ | 10 | 3 | – | 0.0% | 0.0% |
| /Casa/Rimini/Vodafone ⚠ | 7 | 3 | – | 0.0% | 0.0% |
| /Progetti/Evridigit/Clienti/Interpretalis.com ⚠ | 15 | 3 | 100.0% | 33.3% | 50.0% |
| /Progetti/Liceo-Volta ⚠ | 11 | 3 | – | 0.0% | 0.0% |
| /Progetti/Progetti vari ⚠ | 22 | 3 | – | 0.0% | 0.0% |
| /Varie ⚠ | 14 | 3 | – | 0.0% | 0.0% |
| /_Famiglia/Alexandro/Importanti ⚠ | 6 | 2 | – | 0.0% | 0.0% |
| /_Famiglia/Costas e Giola ⚠ | 5 | 2 | – | 0.0% | 0.0% |
| /_z Evridiky/Clienti/Darkpark ⚠ | 9 | 2 | 100.0% | 50.0% | 66.7% |
| /_z Evridiky/www.evridiky.com ⚠ | 7 | 2 | – | 0.0% | 0.0% |
| /Casa/Cipro ⚠ | 9 | 2 | – | 0.0% | 0.0% |
| /Casa/Utenze ⚠ | 14 | 2 | 100.0% | 100.0% | 100.0% |
| /_Famiglia ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /_z Evridiky/Banche ⚠ | 1 | 1 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze/A2A ⚠ | 4 | 1 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze/Netflix ⚠ | 1 | 1 | – | 0.0% | 0.0% |
| /Progetti/Domotica ⚠ | 7 | 1 | – | 0.0% | 0.0% |
| /Progetti/Evridigit/Clienti ⚠ | 12 | 1 | – | 0.0% | 0.0% |
| /Progetti/Evridigit/Documentazione ⚠ | 5 | 1 | – | 0.0% | 0.0% |
| /_DaFare ⚠ | 3 | 0 | – | – | 0.0% |
| /_z Evridiky ⚠ | 1 | 0 | – | – | 0.0% |
| /_z Evridiky/Fornitori/Altri ⚠ | 16 | 0 | – | – | 0.0% |
| /_z Evridiky/Nota spese ⚠ | 4 | 0 | – | – | 0.0% |
| /Casa/Rimini/Negozio ⚠ | 2 | 0 | – | – | 0.0% |
| /Commercialista/Dichiarazione x 2026 ⚠ | 2 | 0 | – | – | 0.0% |
| /Progetti/Evridigit/Bandi ⚠ | 6 | 0 | – | – | 0.0% |
| /Progetti/Evridigit/Clienti/vickystaris.com ⚠ | 2 | 0 | – | – | 0.0% |