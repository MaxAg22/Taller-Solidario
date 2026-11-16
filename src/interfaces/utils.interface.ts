export interface ConfirmModalType {
  id: string;
  onConfirm: (id: string) => void;
  onClose: () => void;
  confirmLabel: string;
  destructive?: boolean;
  title?: string;
  description?: string;
  isPending?: boolean;
}
