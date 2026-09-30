## Evaluation report — andrea.clementi@yahoo.it

- Algorithm: tfidf_naive_bayes · features: headers+body
- Trained: 2026-09-26T15:20:23.821Z · messages: 4191
- Date filter: last 18 months (since 2025-03-27), 17391 older messages skipped
- Hold-out: 20% → 849 test messages, evaluation model trained on 3342
- **Accuracy: 79.4%** · macro-F1: 50.3%
- Confidence: calibrated (marginPerSqrtToken, AUC 0.860) on 428 test messages; threshold table measured on the other 421

### Confidence threshold

| Threshold | Coverage | Messages | Precision above threshold |
|---:|---:|---:|---:|
| ≥ 50% | 80.8% | 340 | 87.4% |
| ≥ 60% | 76.0% | 320 | 88.8% |
| ≥ 70% | 71.0% | 299 | 90.6% |
| ≥ 80% ◀ | 55.8% | 235 | 94.0% |
| ≥ 90% | 33.7% | 142 | 97.9% |
| ≥ 95% | 33.7% | 142 | 97.9% |

### Top confusions (actual → predicted)

| Actual folder | Predicted folder | Count |
|---|---|---:|
| /_Accounts | /_Notifiche | 17 |
| /_AcquistiOnLine | /_z Evridiky/Nota spese/2026 | 14 |
| /_Notifiche | /_Accounts | 8 |
| /_z Evridiky/Nota spese/2025 | /_z Evridiky/Nota spese/2026 | 7 |
| /_z Evridiky/Nota spese/2026 | /_z Evridiky/Nota spese/2025 | 6 |
| /_AcquistiOnLine | /_z Evridiky/Nota spese/2025 | 5 |
| /_News | /_Accounts | 5 |
| /_z Evridiky/Clienti/Max Mara | /_z Evridiky/Commercialista | 5 |
| /_z Evridiky/Nota spese/2025 | /_AcquistiOnLine | 5 |
| /_AcquistiOnLine | /_Notifiche | 4 |
| /_News | /_Notifiche | 4 |
| /Progetti/FeedbackLoop | /_Notifiche | 4 |
| /_Famiglia/Alexandro/Liceo A.Volta | /_z Evridiky/Commercialista | 3 |
| /_Famiglia/Alexandro/Medicina | /Medicina | 3 |
| /_News | /_z Evridiky/Fornitori/Arval | 3 |
| /_News | /BancheAssicurazioni | 3 |
| /_z Evridiky/Nota spese/2025 | /Viaggi - Compagnie aeree | 3 |
| /_z Evridiky/Nota spese/2026 | /_Notifiche | 3 |
| /Medicina | /BancheAssicurazioni | 3 |
| /Postadmz | /_Accounts | 3 |

### Per folder (⚠ = fewer than 5 test messages)

| Folder | Train | Test | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| /_News | 946 | 217 | 95.2% | 91.7% | 93.4% |
| /_AcquistiOnLine | 489 | 151 | 93.2% | 81.5% | 86.9% |
| /_Notifiche | 477 | 120 | 71.3% | 85.0% | 77.6% |
| /_Accounts | 190 | 51 | 52.5% | 60.8% | 56.4% |
| /Postadmz | 151 | 43 | 97.4% | 86.0% | 91.4% |
| /_z Evridiky/Nota spese/2025 | 128 | 35 | 56.7% | 48.6% | 52.3% |
| /_z Evridiky/Nota spese/2026 | 113 | 30 | 43.5% | 66.7% | 52.6% |
| /_z Evridiky/Fatture - notifiche | 121 | 26 | 92.9% | 100.0% | 96.3% |
| /_z Evridiky/Commercialista | 115 | 25 | 69.4% | 100.0% | 82.0% |
| /BancheAssicurazioni | 63 | 18 | 63.0% | 94.4% | 75.6% |
| /Progetti/FeedbackLoop | 61 | 14 | 75.0% | 64.3% | 69.2% |
| /Viaggi - Compagnie aeree | 52 | 12 | 78.6% | 91.7% | 84.6% |
| /_Famiglia/Alexandro/Liceo A.Volta | 41 | 11 | 66.7% | 54.5% | 60.0% |
| /_z Evridiky/Evridiky PEC | 24 | 10 | 83.3% | 100.0% | 90.9% |
| /_z Evridiky/Clienti/Max Mara | 20 | 8 | 100.0% | 37.5% | 54.5% |
| /Casa/Lanzone40/Condominio | 26 | 8 | 100.0% | 75.0% | 85.7% |
| /_Famiglia/Alexandro/Medicina | 13 | 7 | 50.0% | 14.3% | 22.2% |
| /Medicina | 15 | 7 | 57.1% | 57.1% | 57.1% |
| /_z Evridiky/Fornitori/Arval | 36 | 5 | 55.6% | 100.0% | 71.4% |
| /RichiesteAssistenza | 12 | 5 | – | 0.0% | 0.0% |
| /_Famiglia/Stefano/Attivita ⚠ | 40 | 4 | 60.0% | 75.0% | 66.7% |
| /_z Evridiky/Clienti/Ipekyol ⚠ | 10 | 4 | 100.0% | 75.0% | 85.7% |
| /_z Evridiky/Commercialista circolari ⚠ | 26 | 4 | 100.0% | 100.0% | 100.0% |
| /Casa/Lanzone40/Utenze/Vodafone ⚠ | 17 | 4 | 100.0% | 100.0% | 100.0% |
| /Casa/Collaboratori ⚠ | 6 | 3 | 100.0% | 66.7% | 80.0% |
| /Commercialista/Dichiarazione x 2025 ⚠ | 16 | 3 | 100.0% | 66.7% | 80.0% |
| /_Famiglia/Stefano/Medicina ⚠ | 18 | 2 | 33.3% | 50.0% | 40.0% |
| /_z Evridiky/Clienti/Darkpark ⚠ | 9 | 2 | 100.0% | 100.0% | 100.0% |
| /Amici ⚠ | 7 | 2 | – | 0.0% | 0.0% |
| /Casa/Rimini ⚠ | 9 | 2 | – | 0.0% | 0.0% |
| /Commercialista ⚠ | 10 | 2 | – | 0.0% | 0.0% |
| /Junk ⚠ | 15 | 2 | 0.0% | 0.0% | 0.0% |
| /Progetti/Liceo-Volta ⚠ | 6 | 2 | – | 0.0% | 0.0% |
| /Trenitalia ⚠ | 4 | 2 | – | 0.0% | 0.0% |
| /_Famiglia/Vicky ⚠ | 21 | 1 | 100.0% | 100.0% | 100.0% |
| /_z Evridiky/Vari ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /PA/Altre ⚠ | 5 | 1 | – | 0.0% | 0.0% |
| /PA/Comune-Milano ⚠ | 5 | 1 | – | 0.0% | 0.0% |
| /Progetti/Evridigit/Archivio messaggi ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /Progetti/Evridigit/Contabilita ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /Progetti/ICS Diaz ⚠ | 1 | 1 | – | 0.0% | 0.0% |
| /Progetti/Progetti vari ⚠ | 0 | 1 | – | 0.0% | 0.0% |
| /Amici/Amici_Lavoro ⚠ | 1 | 0 | – | – | 0.0% |
| /Casa/Lanzone40/Elettrodomestici e mobili ⚠ | 2 | 0 | – | – | 0.0% |
| /Casa/Rimini/Negozio ⚠ | 2 | 0 | – | – | 0.0% |
| /Commercialista/Dichiarazione x 2026 ⚠ | 2 | 0 | – | – | 0.0% |
| /PA/ATM ⚠ | 3 | 0 | – | – | 0.0% |
| /Progetti/5VIE ⚠ | 13 | 0 | – | – | 0.0% |
| /Varie ⚠ | 1 | 0 | – | – | 0.0% |