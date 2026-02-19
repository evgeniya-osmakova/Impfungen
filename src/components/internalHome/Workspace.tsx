import { useTranslation } from 'react-i18next';

import { BUTTON_VARIANT, HTML_BUTTON_TYPE } from '../../constants/ui';
import { resolveAppLanguage } from '../../i18n/resources';
import { useInternalHomeUiStore } from '../../store/internalHomeUiStore';
import { useVaccinationStore } from '../../store/vaccinationStore';
import { selectVaccinationViewData } from '../../store/vaccinationStoreSelectors';
import { Button } from '../../ui';

import { useDiseaseLabels } from './useDiseaseLabels';
import { useDoseModalActions } from './useDoseModalActions';
import { VaccinationRecords } from './VaccinationRecords';

import styles from './Content.module.css';

export const Workspace = () => {
  const { i18n, t } = useTranslation();
  const language = resolveAppLanguage(i18n.resolvedLanguage);
  const { resolveDiseaseLabelById } = useDiseaseLabels();
  const {
    cancelEdit,
    country,
    editingDiseaseId,
    records,
    removeRecord,
    startEditRecord,
  } = useVaccinationStore();
  const { openFormModal } = useInternalHomeUiStore();
  const { openAddDoseModal, openMarkPlannedDoneModal } = useDoseModalActions();

  const { recordsForView } = selectVaccinationViewData({ country, editingDiseaseId, records });

  if (!country) {
    return null;
  }

  const handleOpenFormModal = () => {
    cancelEdit();
    openFormModal();
  };

  const handleEditRecord = (diseaseId: string) => {
    startEditRecord(diseaseId);
    openFormModal();
  };

  return (
    <div className={styles.internalHomeContent__workspace}>
      <div className={styles.internalHomeContent__workspaceToolbar}>
        <Button
          className={styles.internalHomeContent__openFormButton}
          onClick={handleOpenFormModal}
          type={HTML_BUTTON_TYPE.button}
          variant={BUTTON_VARIANT.primary}
        >
          {t('internal.form.actions.openModal')}
        </Button>
      </div>
      <div className={styles.internalHomeContent__recordsPane}>
        <VaccinationRecords
          language={language}
          onAddDose={openAddDoseModal}
          onDeleteRecord={removeRecord}
          onEditRecord={handleEditRecord}
          onMarkPlannedDone={openMarkPlannedDoneModal}
          records={recordsForView}
          resolveDiseaseLabelById={resolveDiseaseLabelById}
        />
      </div>
    </div>
  );
};
