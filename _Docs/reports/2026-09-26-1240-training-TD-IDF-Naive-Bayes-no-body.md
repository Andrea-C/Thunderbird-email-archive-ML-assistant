## Evaluation report — andrea.clementi@yahoo.it

- Algorithm: tfidf_naive_bayes · features: headers
- Trained: 2026-09-26T10:39:10.784Z · messages: 21582
- Hold-out: 20% → 4338 test messages, evaluation model trained on 17244
- **Accuracy: 83.1%** · macro-F1: 58.4%

### Confidence threshold

| Threshold | Coverage | Messages | Precision above threshold |
|---:|---:|---:|---:|
| ≥ 50% | 99.8% | 4331 | 83.2% |
| ≥ 60% | 99.4% | 4311 | 83.4% |
| ≥ 70% | 99.0% | 4294 | 83.7% |
| ≥ 80% ◀ | 98.4% | 4270 | 84.0% |
| ≥ 90% | 97.7% | 4239 | 84.3% |
| ≥ 95% | 96.7% | 4195 | 84.8% |

### Top confusions (actual → predicted)

| Actual folder | Predicted folder | Count |
|---|---|---:|
| /_Notifiche | /_Accounts | 44 |
| /Commercialista | /_z Evridiky/Commercialista | 27 |
| /_News | /_Accounts | 23 |
| /_Notifiche | /Progetti/FeedbackLoop | 21 |
| /_z Evridiky/Nota spese/2026 | /_AcquistiOnLine | 18 |
| /_z Evridiky/Nota spese/2025 | /_AcquistiOnLine | 13 |
| /Aruba | /andreaclementi.it | 12 |
| /_News | /_Notifiche | 11 |
| /_z Evridiky/Clienti/Max Mara | /_z Evridiky/Commercialista | 11 |
| /_Accounts | /_Notifiche | 10 |
| /_Famiglia/Alexandro/Medicina | /Medicina | 10 |
| /_AcquistiOnLine | /_Accounts | 8 |
| /Commercialista | /Casa/Collaboratori | 8 |
| /Documentazione | /_Famiglia/Vicky | 8 |
| /Progetti/Evridigit/Archivio messaggi | /Progetti/Evridigit/Notifiche | 8 |
| /Progetti/Evridigit/Contabilita | /_Notifiche | 7 |
| /_z Evridiky/Nota spese/2026 | /_z Evridiky/Nota spese/2025 | 6 |
| /Casa/Lanzone40 | /Casa/Lanzone40/Elettrodomestici e mobili | 6 |
| /Commercialista/Dichiarazione x 2025 | /_Famiglia/Stefano/Medicina | 6 |
| /RichiesteAssistenza | /_Accounts | 6 |

### Per folder (⚠ = fewer than 5 test messages)

| Folder | Train | Test | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| /_News | 2278 | 590 | 94.0% | 88.3% | 91.1% |
| /_Accounts | 1525 | 346 | 69.6% | 84.7% | 76.4% |
| /_AcquistiOnLine | 980 | 284 | 82.1% | 92.3% | 86.9% |
| /_z Evridiky/Commercialista | 1113 | 277 | 76.0% | 96.0% | 84.8% |
| /_Notifiche | 963 | 238 | 77.4% | 64.7% | 70.5% |
| /BancheAssicurazioni | 745 | 177 | 92.4% | 96.6% | 94.5% |
| /Formazione | 575 | 168 | 95.4% | 99.4% | 97.4% |
| /_z Evridiky/Fatture - notifiche | 586 | 149 | 100.0% | 100.0% | 100.0% |
| /Trenitalia | 546 | 135 | 92.3% | 97.8% | 95.0% |
| /_Famiglia/Vicky | 432 | 110 | 76.2% | 99.1% | 86.2% |
| /Progetti/ICS Diaz | 355 | 107 | 91.7% | 93.5% | 92.6% |
| /Progetti/Evridigit/Notifiche | 397 | 95 | 83.6% | 96.8% | 89.8% |
| /_Famiglia/Alexandro | 432 | 94 | 84.5% | 92.6% | 88.3% |
| /Progetti/5VIE | 306 | 83 | 83.8% | 80.7% | 82.2% |
| /Amici | 359 | 82 | 84.4% | 79.3% | 81.8% |
| /_z Evridiky/Commercialista circolari | 374 | 79 | 92.9% | 98.7% | 95.7% |
| /Viaggi - Compagnie aeree | 297 | 72 | 84.4% | 90.3% | 87.2% |
| /andreaclementi.it | 283 | 66 | 74.4% | 97.0% | 84.2% |
| /Progetti/FeedbackLoop | 230 | 66 | 62.2% | 77.3% | 68.9% |
| /Casa/Lanzone40/Condominio | 265 | 64 | 88.7% | 98.4% | 93.3% |
| /Casa/Lanzone40 | 239 | 56 | 88.0% | 78.6% | 83.0% |
| /Medicina | 218 | 54 | 67.1% | 94.4% | 78.5% |
| /_z Evridiky/Evridiky PEC | 185 | 47 | 68.9% | 89.4% | 77.8% |
| /Casa/Collaboratori | 213 | 47 | 78.2% | 91.5% | 84.3% |
| /RichiesteAssistenza | 125 | 44 | 80.6% | 65.9% | 72.5% |
| /Postadmz | 151 | 43 | 97.4% | 86.0% | 91.4% |
| /_z Evridiky/Nota spese/2025 | 151 | 38 | 57.1% | 42.1% | 48.5% |
| /Commercialista | 150 | 37 | 100.0% | 2.7% | 5.3% |
| /Documentazione | 104 | 36 | 87.5% | 38.9% | 53.8% |
| /_Famiglia/Stefano/Attivita | 152 | 33 | 100.0% | 63.6% | 77.8% |
| /Progetti/Evridigit/Archivio messaggi | 103 | 31 | 61.1% | 35.5% | 44.9% |
| /_Famiglia/Alexandro/Liceo A.Volta | 112 | 30 | 85.7% | 80.0% | 82.8% |
| /_Famiglia/Parenti | 171 | 30 | 80.6% | 83.3% | 82.0% |
| /_z Evridiky/Nota spese/2026 | 113 | 30 | 40.0% | 6.7% | 11.4% |
| /_z Evridiky/Telepass | 108 | 29 | 96.7% | 100.0% | 98.3% |
| /_Famiglia/Stefano/Medicina | 100 | 28 | 70.6% | 85.7% | 77.4% |
| /_z Evridiky/Clienti/Max Mara | 108 | 28 | 94.1% | 57.1% | 71.1% |
| /_Famiglia/Stefano | 144 | 27 | 88.0% | 81.5% | 84.6% |
| /Casa/Lanzone40/Elettrodomestici e mobili | 110 | 27 | 72.0% | 66.7% | 69.2% |
| /Junk | 121 | 25 | 61.5% | 32.0% | 42.1% |
| /Aruba | 74 | 22 | 100.0% | 45.5% | 62.5% |
| /Lavoro - Ricerca | 88 | 22 | 83.3% | 90.9% | 87.0% |
| /Casa | 46 | 20 | 100.0% | 90.0% | 94.7% |
| /Progetti/Evridigit/Contabilita | 49 | 17 | 50.0% | 23.5% | 32.0% |
| /_z Evridiky/Fornitori | 87 | 16 | 63.6% | 43.8% | 51.9% |
| /_z Evridiky/Fornitori/Arval | 84 | 15 | 75.0% | 80.0% | 77.4% |
| /_Famiglia/Alexandro/Medicina | 31 | 14 | 75.0% | 21.4% | 33.3% |
| /_z Evridiky/Vari | 56 | 13 | 100.0% | 46.2% | 63.2% |
| /Casa/Lanzone40/Utenze/Vodafone | 66 | 13 | 68.4% | 100.0% | 81.3% |
| /PA/Altre | 38 | 11 | 71.4% | 45.5% | 55.6% |
| /_Famiglia/Alexandro/Notifiche Alex | 31 | 10 | 90.9% | 100.0% | 95.2% |
| /Progetti/Romboli e Associati | 23 | 10 | 83.3% | 100.0% | 90.9% |
| /Progetti/5VIE/Rapisardi | 30 | 8 | 50.0% | 50.0% | 50.0% |
| /Progetti/Evridigit/Registrazioni | 21 | 8 | 0.0% | 0.0% | 0.0% |
| /Amici/Amici_Lavoro | 37 | 7 | 83.3% | 71.4% | 76.9% |
| /Amici/Amici_Renzo | 28 | 7 | 100.0% | 100.0% | 100.0% |
| /Andrea_Vicky | 38 | 7 | 0.0% | 0.0% | 0.0% |
| /PA/ATM | 32 | 7 | 66.7% | 85.7% | 75.0% |
| /Progetti/5VIE/5vie.milano.it | 21 | 7 | 100.0% | 14.3% | 25.0% |
| /Amici/ISEF | 15 | 6 | 100.0% | 33.3% | 50.0% |
| /Casa/Rimini | 23 | 6 | 66.7% | 33.3% | 44.4% |
| /Commercialista/Dichiarazione x 2025 | 22 | 6 | – | 0.0% | 0.0% |
| /Progetti/Evridigit | 14 | 6 | – | 0.0% | 0.0% |
| /_z Evridiky/Fornitori/ShareNow Car2Go | 6 | 5 | 100.0% | 40.0% | 57.1% |
| /Casa/Lanzone40/Amministratore | 40 | 5 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze/Fastweb | 21 | 5 | 83.3% | 100.0% | 90.9% |
| /PA/Comune-Milano | 31 | 5 | 100.0% | 40.0% | 57.1% |
| /Progetti/SDE Social Digital Education | 15 | 5 | 100.0% | 60.0% | 75.0% |
| /_z Evridiky/Clienti/Ipekyol ⚠ | 10 | 4 | 100.0% | 50.0% | 66.7% |
| /_z Evridiky/Ricerca ⚠ | 11 | 4 | 100.0% | 25.0% | 40.0% |
| /Evridiky ⚠ | 19 | 4 | – | 0.0% | 0.0% |
| /Progetti/5VIE/Rapisardi tutte ⚠ | 23 | 4 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze ⚠ | 10 | 3 | – | 0.0% | 0.0% |
| /Casa/Rimini/Vodafone ⚠ | 7 | 3 | – | 0.0% | 0.0% |
| /Progetti/Evridigit/Clienti/Interpretalis.com ⚠ | 15 | 3 | 100.0% | 33.3% | 50.0% |
| /Progetti/Liceo-Volta ⚠ | 11 | 3 | – | 0.0% | 0.0% |
| /Progetti/Progetti vari ⚠ | 22 | 3 | 100.0% | 33.3% | 50.0% |
| /Varie ⚠ | 14 | 3 | 100.0% | 33.3% | 50.0% |
| /_Famiglia/Alexandro/Importanti ⚠ | 6 | 2 | 100.0% | 100.0% | 100.0% |
| /_Famiglia/Costas e Giola ⚠ | 5 | 2 | – | 0.0% | 0.0% |
| /_z Evridiky/Clienti/Darkpark ⚠ | 9 | 2 | 100.0% | 50.0% | 66.7% |
| /_z Evridiky/www.evridiky.com ⚠ | 7 | 2 | 0.0% | 0.0% | 0.0% |
| /Casa/Cipro ⚠ | 9 | 2 | 100.0% | 100.0% | 100.0% |
| /Casa/Utenze ⚠ | 14 | 2 | 66.7% | 100.0% | 80.0% |
| /_Famiglia ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /_z Evridiky/Banche ⚠ | 1 | 1 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze/A2A ⚠ | 4 | 1 | – | 0.0% | 0.0% |
| /Casa/Lanzone40/Utenze/Netflix ⚠ | 1 | 1 | – | 0.0% | 0.0% |
| /Progetti/Domotica ⚠ | 7 | 1 | 100.0% | 100.0% | 100.0% |
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