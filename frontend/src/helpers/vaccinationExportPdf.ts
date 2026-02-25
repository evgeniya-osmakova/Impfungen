import { formatVaccinationExportDate } from 'src/helpers/vaccinationExportRows.ts';
import type {
  VaccinationCompletedExportColumnLabels,
  VaccinationCompletedExportGroup,
  VaccinationCompletedExportMeta,
  VaccinationCompletedExportPdfLabels,
} from 'src/interfaces/vaccinationExport.ts';

type PdfVfs = Record<string, string>;

interface PdfDownload {
  download: (filename: string) => void;
}

interface PdfMakeInstance {
  addVirtualFileSystem?: (vfs: PdfVfs) => void;
  createPdf: (definition: unknown) => PdfDownload;
  vfs?: PdfVfs;
}

interface ExportVaccinationCompletedPdfParams {
  columnLabels: VaccinationCompletedExportColumnLabels;
  filename: string;
  groups: readonly VaccinationCompletedExportGroup[];
  meta: VaccinationCompletedExportMeta;
  pdfLabels: VaccinationCompletedExportPdfLabels;
}

let pdfMakeInstancePromise: Promise<PdfMakeInstance> | null = null;

const resolvePdfMakeInstance = (moduleValue: unknown): PdfMakeInstance => {
  if (typeof moduleValue === 'object' && moduleValue && 'default' in moduleValue) {
    const defaultExport = (moduleValue as { default?: unknown }).default;

    if (defaultExport) {
      return defaultExport as PdfMakeInstance;
    }
  }

  return moduleValue as PdfMakeInstance;
};

const resolvePdfVfs = (moduleValue: unknown): PdfVfs | null => {
  if (typeof moduleValue !== 'object' || moduleValue === null) {
    return null;
  }

  const module = moduleValue as {
    default?: unknown;
    pdfMake?: { vfs?: PdfVfs };
    vfs?: PdfVfs;
  };

  if (module.pdfMake?.vfs) {
    return module.pdfMake.vfs;
  }

  if (module.vfs) {
    return module.vfs;
  }

  if (typeof module.default === 'object' && module.default) {
    const defaultModule = module.default as {
      pdfMake?: { vfs?: PdfVfs };
      vfs?: PdfVfs;
    };

    const nestedVfs = defaultModule.pdfMake?.vfs ?? defaultModule.vfs;

    if (nestedVfs) {
      return nestedVfs;
    }

    return module.default as PdfVfs;
  }

  return null;
};

const loadPdfMake = async (): Promise<PdfMakeInstance> => {
  if (pdfMakeInstancePromise) {
    return pdfMakeInstancePromise;
  }

  pdfMakeInstancePromise = (async () => {
    const [pdfMakeModule, pdfFontsModule] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      import('pdfmake/build/vfs_fonts'),
    ]);
    const pdfMake = resolvePdfMakeInstance(pdfMakeModule);
    const vfs = resolvePdfVfs(pdfFontsModule);

    if (vfs) {
      if (typeof pdfMake.addVirtualFileSystem === 'function') {
        pdfMake.addVirtualFileSystem(vfs);
      } else {
        pdfMake.vfs = vfs;
      }
    }

    return pdfMake;
  })();

  return pdfMakeInstancePromise;
};

const padTwoDigits = (value: number): string => String(value).padStart(2, '0');

const formatExportedAt = (date: Date): string => {
  const exportDate = [
    date.getFullYear(),
    padTwoDigits(date.getMonth() + 1),
    padTwoDigits(date.getDate()),
  ].join('-');
  const formattedDate = formatVaccinationExportDate(exportDate);
  const hours = padTwoDigits(date.getHours());
  const minutes = padTwoDigits(date.getMinutes());

  return `${formattedDate} ${hours}:${minutes}`;
};

export const buildVaccinationCompletedPdfDocument = ({
  columnLabels,
  groups,
  meta,
  pdfLabels,
}: Omit<ExportVaccinationCompletedPdfParams, 'filename'>) => {
  const totalDoseCount = groups.reduce((sum, group) => sum + group.doses.length, 0);
  const groupedContent = groups.flatMap((group, index) => ([
    {
      margin: [0, index === 0 ? 0 : 8, 0, 4],
      style: 'groupTitle',
      text: group.diseaseLabel,
    },
    {
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 6],
      table: {
        body: [
          [
            { style: 'tableHeader', text: columnLabels.completedAt },
            { style: 'tableHeader', text: columnLabels.doseKind },
            { style: 'tableHeader', text: columnLabels.tradeName },
            { style: 'tableHeader', text: columnLabels.batchNumber },
          ],
          ...group.doses.map((dose) => ([
            dose.formattedCompletedAt,
            dose.doseKindLabel,
            dose.tradeName ?? '',
            dose.batchNumber ?? '',
          ])),
        ],
        headerRows: 1,
        widths: [90, 120, '*', 90],
      },
    },
  ]));

  return {
    content: [
      { style: 'title', text: pdfLabels.title },
      {
        columns: [
          { text: `${pdfLabels.profileLabel}: ${meta.profileName}` },
          { alignment: 'right', text: `${pdfLabels.exportedAtLabel}: ${formatExportedAt(meta.exportedAt)}` },
        ],
        margin: [0, 0, 0, 6],
      },
      {
        margin: [0, 0, 0, 12],
        text: `${pdfLabels.recordsCountLabel}: ${totalDoseCount}`,
      },
      ...groupedContent,
    ],
    defaultStyle: {
      fontSize: 10,
    },
    pageMargins: [24, 24, 24, 24],
    pageOrientation: 'landscape',
    pageSize: 'A4',
    styles: {
      groupTitle: {
        bold: true,
        fontSize: 12,
      },
      tableHeader: {
        bold: true,
        fillColor: '#eef2f7',
      },
      title: {
        bold: true,
        fontSize: 16,
        margin: [0, 0, 0, 12],
      },
    },
  };
};

export const exportVaccinationCompletedPdf = async ({
  columnLabels,
  filename,
  groups,
  meta,
  pdfLabels,
}: ExportVaccinationCompletedPdfParams): Promise<void> => {
  const pdfMake = await loadPdfMake();
  const documentDefinition = buildVaccinationCompletedPdfDocument({
    columnLabels,
    groups,
    meta,
    pdfLabels,
  });

  pdfMake.createPdf(documentDefinition).download(filename);
};

