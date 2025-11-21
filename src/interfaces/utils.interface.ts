export interface ConfirmModalType {
  confirmDeleteId: string;
  handleDeleteNotebook: (id: string) => void;
  setConfirmDeleteId: (id: string | null) => void;
  item: string;
}
