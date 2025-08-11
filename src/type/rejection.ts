export interface RejectionData {
    reason: string;
    customReason?: string;
    allowResubmit: boolean;
    resubmitDeadline?: string;
  }