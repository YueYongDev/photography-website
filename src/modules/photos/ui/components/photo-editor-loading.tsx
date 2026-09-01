import styles from "../photo-editor.module.css";

type PhotoEditorLoadingProps = {
  label?: string;
};

const LoadingBlock = ({
  className,
}: {
  className?: string;
}) => (
  <span
    className={[styles.editorLoadingBlock, className].filter(Boolean).join(" ")}
    aria-hidden="true"
  />
);

export const PhotoEditorLoading = ({
  label = "Loading photo editor",
}: PhotoEditorLoadingProps) => (
  <div
    className={styles.editorLoading}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <header className={styles.editorLoadingHeader}>
      <div className={styles.editorLoadingIdentity}>
        <LoadingBlock className={styles.editorLoadingBack} />
        <div className={styles.editorLoadingTitle}>
          <LoadingBlock className={styles.editorLoadingEyebrow} />
          <LoadingBlock className={styles.editorLoadingHeading} />
        </div>
      </div>

      <div className={styles.editorLoadingActions}>
        <LoadingBlock className={styles.editorLoadingActionWide} />
        <LoadingBlock className={styles.editorLoadingActionPrimary} />
        <LoadingBlock className={styles.editorLoadingActionSquare} />
      </div>
    </header>

    <div className={styles.editorLoadingWorkspace}>
      <section className={styles.editorLoadingMedia}>
        <div className={styles.editorLoadingStage}>
          <LoadingBlock className={styles.editorLoadingPhoto} />
          <div className={styles.editorLoadingZoom} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={styles.editorLoadingMetadata} aria-hidden="true">
          <LoadingBlock />
          <LoadingBlock />
          <LoadingBlock />
          <LoadingBlock />
        </div>
      </section>

      <aside className={styles.editorLoadingInspector} aria-hidden="true">
        <div className={styles.editorLoadingTabs}>
          <LoadingBlock />
          <LoadingBlock />
          <LoadingBlock />
        </div>

        <div className={styles.editorLoadingInspectorBody}>
          <div className={styles.editorLoadingSectionTitle}>
            <LoadingBlock />
            <LoadingBlock />
          </div>

          <div className={styles.editorLoadingField}>
            <LoadingBlock />
            <LoadingBlock />
          </div>

          <div className={styles.editorLoadingField}>
            <LoadingBlock />
            <LoadingBlock className={styles.editorLoadingTextarea} />
          </div>

          <LoadingBlock className={styles.editorLoadingInlineAction} />
        </div>
      </aside>
    </div>
  </div>
);

export const PhotoEditorPageLoading = (props: PhotoEditorLoadingProps) => (
  <div className={styles.page}>
    <PhotoEditorLoading {...props} />
  </div>
);
