import { useMainPageUi } from 'src/components/MainContent/useMainPageUi.ts';
import { useVaccinationPageUi } from 'src/components/MainContent/useVaccinationPageUi.ts';

import { CatalogPane } from './components/CatalogPane/CatalogPane';
import { Modals } from './components/Modals/Modals';
import { TopRow } from './components/TopRow/TopRow';
import { Workspace } from './components/Workspace/Workspace';

import styles from './MainContent.module.css';

export const MainContent = () => {
  const mainPageUi = useMainPageUi();
  const vaccinationPageUi = useVaccinationPageUi();
  const topRowUi = {
    openCompleteDoseModal: mainPageUi.openCompleteDoseModal,
  };
  const workspaceUi = {
    openCompleteDoseModal: mainPageUi.openCompleteDoseModal,
    openFormModal: mainPageUi.openFormModal,
  };
  const workspaceVaccinationUi = {
    cancelEdit: vaccinationPageUi.cancelEdit,
    editingDiseaseId: vaccinationPageUi.editingDiseaseId,
    startEditRecord: vaccinationPageUi.startEditRecord,
  };
  const catalogPaneUi = {
    cancelEdit: vaccinationPageUi.cancelEdit,
    categoryFilter: vaccinationPageUi.categoryFilter,
    editingDiseaseId: vaccinationPageUi.editingDiseaseId,
    openFormModalWithPrefilledDisease: mainPageUi.openFormModalWithPrefilledDisease,
    searchQuery: vaccinationPageUi.searchQuery,
    setCategoryFilter: vaccinationPageUi.setCategoryFilter,
    setSearchQuery: vaccinationPageUi.setSearchQuery,
  };
  const modalsUi = {
    closeCompleteDoseModal: mainPageUi.closeCompleteDoseModal,
    closeFormModal: mainPageUi.closeFormModal,
    completeDoseDraft: mainPageUi.completeDoseDraft,
    completeDoseErrorKey: mainPageUi.completeDoseErrorKey,
    formErrorKey: mainPageUi.formErrorKey,
    isCompleteDoseModalOpen: mainPageUi.isCompleteDoseModalOpen,
    isFormModalOpen: mainPageUi.isFormModalOpen,
    prefilledDiseaseId: mainPageUi.prefilledDiseaseId,
    setCompleteDoseErrorKey: mainPageUi.setCompleteDoseErrorKey,
    setFormErrorKey: mainPageUi.setFormErrorKey,
  };
  const modalsVaccinationUi = {
    cancelEdit: vaccinationPageUi.cancelEdit,
    editingDiseaseId: vaccinationPageUi.editingDiseaseId,
  };

  return (
    <div className={styles.internalHomeContent}>
      <TopRow ui={topRowUi} />
      <Workspace ui={workspaceUi} vaccinationUi={workspaceVaccinationUi} />
      <Modals ui={modalsUi} vaccinationUi={modalsVaccinationUi} />
      <CatalogPane ui={catalogPaneUi} />
    </div>
  );
};
