import { describe, expect, it } from 'vitest';

import type { VaccinationCompletedExportColumnLabels, VaccinationCompletedExportRow } from 'src/interfaces/vaccinationExport.ts';

import { createVaccinationCompletedCsv } from './vaccinationExportCsv';

const columnLabels: VaccinationCompletedExportColumnLabels = {
  batchNumber: 'Batch',
  completedAt: 'Completed at',
  disease: 'Disease',
  doseKind: 'Dose type',
  tradeName: 'Trade name',
};

describe('vaccinationExportCsv', () => {
  it('creates Excel-friendly CSV with BOM, separator hint and CRLF', () => {
    const rows: VaccinationCompletedExportRow[] = [{
      batchNumber: 'B-7',
      completedAt: '2024-06-01',
      diseaseLabel: 'Tetanus',
      formattedCompletedAt: '01.06.2024',
      doseKind: 'nextDose',
      doseKindLabel: 'Next dose',
      tradeName: 'Tdap',
    }];

    const csv = createVaccinationCompletedCsv({ columnLabels, rows });

    expect(csv.startsWith('\uFEFFsep=;\r\n')).toBe(true);
    expect(csv).toContain('"Completed at";"Disease";"Dose type";"Trade name";"Batch"');
    expect(csv).toContain('\r\n"01.06.2024";"Tetanus";"Next dose";"Tdap";"B-7"');
    expect(csv.includes('\n')).toBe(true);
  });

  it('escapes quotes, preserves empty optional values, and mitigates formula injection', () => {
    const rows: VaccinationCompletedExportRow[] = [{
      batchNumber: null,
      completedAt: '2024-06-01',
      diseaseLabel: '="Injected"',
      formattedCompletedAt: '01.06.2024',
      doseKind: 'revaccination',
      doseKindLabel: '+Dose',
      tradeName: 'ACME "Ultra"',
    }];

    const csv = createVaccinationCompletedCsv({ columnLabels, rows });

    expect(csv).toContain(`"'=""Injected"""`);
    expect(csv).toContain(`"'+Dose"`);
    expect(csv).toContain(`"ACME ""Ultra"""`);
    expect(csv).not.toContain(';;');
    expect(csv).toContain('""'); // empty batch column quoted
  });
});
