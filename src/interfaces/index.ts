export * from "./notebook.interface";

export type ConfirmModalType = {
  confirmDeleteId: string | null;
  handleDeleteNotebook: (id: string) => void;
  setConfirmDeleteId: React.Dispatch<React.SetStateAction<string | null>>;
  item: string;
};
