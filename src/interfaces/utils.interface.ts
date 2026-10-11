export interface ConfirmModalType {
  confirmDeleteId: string | null;
  isPending?: boolean;
  handleDeleteNotebook: (id: string) => void;
  setConfirmDeleteId: (id: string | null) => void;
}
