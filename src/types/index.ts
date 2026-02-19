// Types for SherlockIT 2.0

export interface Team {
  id: string;
  teamName: string;
  completedWorlds: string[];
  finalSubmitted: boolean;
  lastActive: Date;
}

export interface World {
  id: string;
  title: string;
  story: string;
  question: string;
  answer: string;
  order: number;
  isLocked: boolean;
}

export interface Announcement {
  id: string;
  message: string;
  createdAt: Date;
}

export interface FinalSubmission {
  id: string;
  teamId: string;
  teamName: string;
  realWorld: string;
  villain: string;
  weapon: string;
  submittedAt: Date;
}

export interface EventControl {
  finalAnswerOpen: boolean;
  finalAnswerStartTime: Date | null;
}

export interface Progress {
  teamId: string;
  teamName: string;
  worldId: string;
  worldTitle: string;
  attempts: number;
  completedAt: Date | null;
}
