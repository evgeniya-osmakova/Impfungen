import { describe, expect, it } from 'vitest';

import type {
  VaccinationCompletedExportColumnLabels,
  VaccinationCompletedExportGroup,
  VaccinationCompletedExportMeta,
  VaccinationCompletedExportPdfLabels,
} from 'src/interfaces/vaccinationExport.ts';

import { buildVaccinationCompletedPdfDocument } from './vaccinationExportPdf';

const columnLabels: VaccinationCompletedExportColumnLabels = {
  batchNumber: 'Batch',
  completedAt: 'Date',
  disease: 'Disease',
  doseKind: 'Dose type',
  tradeName: 'Trade name',
};

const pdfLabels: VaccinationCompletedExportPdfLabels = {
  exportedAtLabel: 'Exported at',
  profileLabel: 'Profile',
  recordsCountLabel: 'Records',
  title: 'Completed vaccinations',
};

const meta: VaccinationCompletedExportMeta = {
  exportedAt: new Date('2026-02-25T12:34:00.000Z'),
  language: 'ru',
  profileName: 'Иван',
};

describe('vaccinationExportPdf', () => {
  it('builds grouped pdf document with disease blocks and ascending dates inside each group', () => {
    const groups: VaccinationCompletedExportGroup[] = [
      {
        diseaseLabel: 'Anthrax',
        doses: [{
          batchNumber: null,
          completedAt: '2024-03-05',
          formattedCompletedAt: '05.03.2024',
          doseKind: 'nextDose',
          doseKindLabel: 'Next dose',
          tradeName: null,
        }],
      },
      {
        diseaseLabel: 'Hepatitis B',
        doses: [
          {
            batchNumber: 'HB-1',
            completedAt: '2024-01-01',
            formattedCompletedAt: '01.01.2024',
            doseKind: 'nextDose',
            doseKindLabel: 'Next dose',
            tradeName: 'Combi',
          },
          {
            batchNumber: '',
            completedAt: '2024-05-01',
            formattedCompletedAt: '01.05.2024',
            doseKind: 'revaccination',
            doseKindLabel: 'Revaccination',
            tradeName: null,
          },
        ],
      },
    ];

    const document = buildVaccinationCompletedPdfDocument({
      columnLabels,
      groups,
      meta,
      pdfLabels,
    }) as {
      content: Array<Record<string, unknown>>;
    };

    expect(document.content[0]).toMatchObject({ text: 'Completed vaccinations' });
    expect(document.content[2]).toMatchObject({ text: 'Records: 3' });

    const anthraxTitle = document.content[3];
    const anthraxTable = document.content[4] as { table: { body: string[][] } };
    const hepatitisTitle = document.content[5];
    const hepatitisTable = document.content[6] as { table: { body: string[][] } };

    expect(anthraxTitle).toMatchObject({ text: 'Anthrax' });
    expect(hepatitisTitle).toMatchObject({ text: 'Hepatitis B' });

    expect(anthraxTable.table.body[1]).toEqual(['05.03.2024', 'Next dose', '', '']);
    expect(hepatitisTable.table.body[1]).toEqual(['01.01.2024', 'Next dose', 'Combi', 'HB-1']);
    expect(hepatitisTable.table.body[2]).toEqual(['01.05.2024', 'Revaccination', '', '']);
  });
});

