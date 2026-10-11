export interface ConfirmModalType {
  title?: string;
  description?: string;
  confirmDeleteId: string | null;
  isPending?: boolean;
  handleDeleteNotebook: (id: string) => void;
  setConfirmDeleteId: (id: string | null) => void;
}
