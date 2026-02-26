export type {
  LeaderboardEntry,
  StickerCollectionItem,
  StickerTier,
  AwardedSticker,
  AwardRecord,
  GamificationSummary,
  RubCertification,
  RubReference,
  FreshnessState,
  FreshnessInfo,
  EnrichedCertification,
  RubProgressItem,
  CertificationInput,
} from './types/gamification.types';

export { gamificationService } from './services/gamification.service';

export {
  computeFreshness,
  freshnessToState,
  getDecayInterval,
  computePoorRevisionTimestamp,
} from './utils/freshness';

export {
  FRESHNESS_DOT_COLORS,
  FRESHNESS_BG_COLORS,
  STATE_PRIORITY,
  getWorstState,
} from './utils/freshness-colors';

export { useRubReference } from './hooks/useRubReference';
export { useRubCertifications } from './hooks/useRubCertifications';
export { useCertifyRub } from './hooks/useCertifyRub';
export { useUndoCertification } from './hooks/useUndoCertification';
export { useRecordRevision } from './hooks/useRecordRevision';
export { useRequestRevision } from './hooks/useRequestRevision';
export { useRevisionHomework } from './hooks/useRevisionHomework';
export type { HomeworkItem } from './hooks/useRevisionHomework';
export { useDormancySync } from './hooks/useDormancySync';
export { useRevisionHealth } from './hooks/useRevisionHealth';

export { RubProgressMap } from './components/RubProgressMap';
export { RubBlock } from './components/RubBlock';
export { JuzRow } from './components/JuzRow';
export { CertificationDialog } from './components/CertificationDialog';
export { RevisionSheet } from './components/RevisionSheet';
export { GroupRevisionSheet } from './components/GroupRevisionSheet';
export type { CertGroup } from './components/GroupRevisionSheet';
export { LevelBadge } from './components/LevelBadge';
export { RevisionWarning } from './components/RevisionWarning';
