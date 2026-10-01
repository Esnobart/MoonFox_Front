import * as Dialog from "@radix-ui/react-dialog";

import css from "./ProductSubmissionModal.module.css";

function ProductSubmissionModal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className={css.triggerButton}>
          Add a product
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={css.overlay} />
        <Dialog.Content className={css.content} aria-describedby={undefined}>
          <p className={css.eyebrow}>Artist workspace</p>
          <Dialog.Title className={css.title}>Product submission</Dialog.Title>

          <Dialog.Close asChild>
            <button type="button" className={css.closeButton} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ProductSubmissionModal;
