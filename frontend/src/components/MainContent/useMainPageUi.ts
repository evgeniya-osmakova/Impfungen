import { useState } from 'react';
import type { MainPageUi } from 'src/interfaces/mainPageUi.ts';

export const useMainPageUi = (): MainPageUi => {
  const [completeDoseDraft, setCompleteDoseDraft] = useState<MainPageUi['completeDoseDraft']>(null);
  const [completeDoseErrorKey, setCompleteDoseErrorKey] = useState<string | null>(null);
  const [formErrorKey, setFormErrorKey] = useState<string | null>(null);
  const [isCompleteDoseModalOpen, setIsCompleteDoseModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [prefilledDiseaseId, setPrefilledDiseaseId] = useState<string | null>(null);

  return {
    closeCompleteDoseModal: () => {
      setCompleteDoseDraft(null);
      setCompleteDoseErrorKey(null);
      setIsCompleteDoseModalOpen(false);
    },
    closeFormModal: () => {
      setFormErrorKey(null);
      setIsFormModalOpen(false);
      setPrefilledDiseaseId(null);
    },
    completeDoseDraft,
    completeDoseErrorKey,
    formErrorKey,
    isCompleteDoseModalOpen,
    isFormModalOpen,
    openCompleteDoseModal: (draft) => {
      setCompleteDoseDraft(draft);
      setCompleteDoseErrorKey(null);
      setFormErrorKey(null);
      setIsCompleteDoseModalOpen(true);
      setIsFormModalOpen(false);
      setPrefilledDiseaseId(null);
    },
    openFormModal: () => {
      setCompleteDoseDraft(null);
      setCompleteDoseErrorKey(null);
      setFormErrorKey(null);
      setIsCompleteDoseModalOpen(false);
      setIsFormModalOpen(true);
      setPrefilledDiseaseId(null);
    },
    openFormModalWithPrefilledDisease: (diseaseId) => {
      setCompleteDoseDraft(null);
      setCompleteDoseErrorKey(null);
      setFormErrorKey(null);
      setIsCompleteDoseModalOpen(false);
      setIsFormModalOpen(true);
      setPrefilledDiseaseId(diseaseId);
    },
    prefilledDiseaseId,
    setCompleteDoseErrorKey,
    setFormErrorKey,
  };
};
