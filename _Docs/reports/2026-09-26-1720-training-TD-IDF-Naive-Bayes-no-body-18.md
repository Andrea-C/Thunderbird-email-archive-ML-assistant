## Evaluation report — andrea.clementi@yahoo.it

- Algorithm: tfidf_naive_bayes · features: headers
- Trained: 2026-09-26T15:41:43.660Z · messages: 4191
- Date filter: last 18 months (since 2025-03-27), 17391 older messages skipped
- Hold-out: 20% → 849 test messages, evaluation model trained on 3342
- **Accuracy: 79.9%** · macro-F1: 61.4%
- Confidence: calibrated (marginPerSqrtToken, AUC 0.863) on 428 test messages; threshold table measured on the other 421

### Confidence threshold

| Threshold | Coverage | Messages | Precision above threshold |
|---:|---:|---:|---:|
| ≥ 50% | 89.1% | 375 | 84.5% |
| ≥ 60% | 89.1% | 375 | 84.5% |
| ≥ 70% | 69.6% | 293 | 92.5% |
| ≥ 80% ◀ | 65.1% | 274 | 93.1% |
| ≥ 90% | 54.2% | 228 | 98.2% |
| ≥ 95% | 39.9% | 168 | 99.4% |

### Top confusions (actual → predicted)

| Actual folder | Predicted folder | Count |
|---|---|---:|
| /_AcquistiOnLine | /_z Evridiky/Nota spese/2026 | 22 |
| /_Notifiche | /_Accounts | 19 |
| /_Accounts | /_Notifiche | 11 |
| /_z Evridiky/Nota spese/2025 | /_z Evridiky/Nota spese/2026 | 8 |
| /_AcquistiOnLine | /_z Evridiky/Nota spese/2025 | 6 |
| /_News | /_Accounts | 6 |
| /_z Evridiky/Nota spese/2026 | /_z Evridiky/Nota spese/2025 | 6 |
| /_z Evridiky/Clienti/Max Mara | /_z Evridiky/Commercialista | 5 |
| /_Famiglia/Alexandro/Medicina | /Medicina | 4 |
| /_News | /_Notifiche | 4 |
| /_z Evridiky/Nota spese/2025 | /_AcquistiOnLine | 4 |
| /_News | /_z Evridiky/Fornitori/Arval | 3 |
| /_News | /_Famiglia/Alexandro/Liceo A.Volta | 3 |
| /_Notifiche | /Progetti/FeedbackLoop | 3 |
| /_z Evridiky/Nota spese/2025 | /Viaggi - Compagnie aeree | 3 |
| /_AcquistiOnLine | /_News | 2 |
| /_AcquistiOnLine | /_Notifiche | 2 |
| /_Famiglia/Alexandro/Medicina | /_Famiglia/Stefano/Medicina | 2 |
| /_Notifiche | /_AcquistiOnLine | 2 |
| /_Notifiche | /_z Evridiky/Commercialista | 2 |

### Per folder (⚠ = fewer than 5 test messages)

| Folder | Train | Test | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| /_News | 946 | 217 | 98.5% | 88.9% | 93.5% |
| /_AcquistiOnLine | 489 | 151 | 92.1% | 77.5% | 84.2% |
| /_Notifiche | 477 | 120 | 79.3% | 73.3% | 76.2% |
| /_Accounts | 190 | 51 | 54.5% | 70.6% | 61.5% |
| /Postadmz | 151 | 43 | 97.6% | 93.0% | 95.2% |
| /_z Evridiky/Nota spese/2025 | 128 | 35 | 54.1% | 57.1% | 55.6% |
| /_z Evridiky/Nota spese/2026 | 113 | 30 | 37.5% | 70.0% | 48.8% |
| /_z Evridiky/Fatture - notifiche | 121 | 26 | 100.0% | 100.0% | 100.0% |
| /_z Evridiky/Commercialista | 115 | 25 | 69.4% | 100.0% | 82.0% |
| /BancheAssicurazioni | 63 | 18 | 73.9% | 94.4% | 82.9% |
| /Progetti/FeedbackLoop | 61 | 14 | 73.3% | 78.6% | 75.9% |
| /Viaggi - Compagnie aeree | 52 | 12 | 78.6% | 91.7% | 84.6% |
| /_Famiglia/Alexandro/Liceo A.Volta | 41 | 11 | 62.5% | 90.9% | 74.1% |
| /_z Evridiky/Evridiky PEC | 24 | 10 | 83.3% | 100.0% | 90.9% |
| /_z Evridiky/Clienti/Max Mara | 20 | 8 | 75.0% | 37.5% | 50.0% |
| /Casa/Lanzone40/Condominio | 26 | 8 | 85.7% | 75.0% | 80.0% |
| /_Famiglia/Alexandro/Medicina | 13 | 7 | 33.3% | 14.3% | 20.0% |
| /Medicina | 15 | 7 | 60.0% | 85.7% | 70.6% |
| /_z Evridiky/Fornitori/Arval | 36 | 5 | 62.5% | 100.0% | 76.9% |
| /RichiesteAssistenza | 12 | 5 | 80.0% | 80.0% | 80.0% |
| /_Famiglia/Stefano/Attivita ⚠ | 40 | 4 | 75.0% | 75.0% | 75.0% |
| /_z Evridiky/Clienti/Ipekyol ⚠ | 10 | 4 | 100.0% | 75.0% | 85.7% |
| /_z Evridiky/Commercialista circolari ⚠ | 26 | 4 | 100.0% | 100.0% | 100.0% |
| /Casa/Lanzone40/Utenze/Vodafone ⚠ | 17 | 4 | 100.0% | 100.0% | 100.0% |
| /Casa/Collaboratori ⚠ | 6 | 3 | 100.0% | 100.0% | 100.0% |
| /Commercialista/Dichiarazione x 2025 ⚠ | 16 | 3 | 100.0% | 100.0% | 100.0% |
| /_Famiglia/Stefano/Medicina ⚠ | 18 | 2 | 50.0% | 100.0% | 66.7% |
| /_z Evridiky/Clienti/Darkpark ⚠ | 9 | 2 | 100.0% | 100.0% | 100.0% |
| /Amici ⚠ | 7 | 2 | 100.0% | 50.0% | 66.7% |
| /Casa/Rimini ⚠ | 9 | 2 | – | 0.0% | 0.0% |
| /Commercialista ⚠ | 10 | 2 | – | 0.0% | 0.0% |
| /Junk ⚠ | 15 | 2 | 0.0% | 0.0% | 0.0% |
| /Progetti/Liceo-Volta ⚠ | 6 | 2 | – | 0.0% | 0.0% |
| /Trenitalia ⚠ | 4 | 2 | – | 0.0% | 0.0% |
| /_Famiglia/Vicky ⚠ | 21 | 1 | 100.0% | 100.0% | 100.0% |
| /_z Evridiky/Vari ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /PA/Altre ⚠ | 5 | 1 | 0.0% | 0.0% | 0.0% |
| /PA/Comune-Milano ⚠ | 5 | 1 | 100.0% | 100.0% | 100.0% |
| /Progetti/Evridigit/Archivio messaggi ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /Progetti/Evridigit/Contabilita ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /Progetti/ICS Diaz ⚠ | 1 | 1 | 100.0% | 100.0% | 100.0% |
| /Progetti/Progetti vari ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /Amici/Amici_Lavoro ⚠ | 1 | 0 | – | – | 0.0% |
| /Casa/Lanzone40/Elettrodomestici e mobili ⚠ | 2 | 0 | 0.0% | – | 0.0% |
| /Casa/Rimini/Negozio ⚠ | 2 | 0 | – | – | 0.0% |
| /Commercialista/Dichiarazione x 2026 ⚠ | 2 | 0 | – | – | 0.0% |
| /PA/ATM ⚠ | 3 | 0 | – | – | 0.0% |
| /Progetti/5VIE ⚠ | 13 | 0 | 0.0% | – | 0.0% |