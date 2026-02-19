import { Team, World, Announcement, FinalSubmission, EventControl, Progress } from '@/types';

// Mock Teams
export const mockTeams: Team[] = [
  { id: '1', teamName: 'The Detectives', completedWorlds: ['w1', 'w2'], finalSubmitted: false, lastActive: new Date('2026-02-19T14:30:00') },
  { id: '2', teamName: 'Mystery Solvers', completedWorlds: ['w1', 'w2', 'w3'], finalSubmitted: true, lastActive: new Date('2026-02-19T14:45:00') },
  { id: '3', teamName: 'Code Breakers', completedWorlds: ['w1'], finalSubmitted: false, lastActive: new Date('2026-02-19T14:20:00') },
  { id: '4', teamName: 'The Sleuths', completedWorlds: ['w1', 'w2', 'w3', 'w4'], finalSubmitted: true, lastActive: new Date('2026-02-19T14:50:00') },
  { id: '5', teamName: 'Puzzle Masters', completedWorlds: [], finalSubmitted: false, lastActive: new Date('2026-02-19T13:00:00') },
  { id: '6', teamName: 'Enigma Squad', completedWorlds: ['w1', 'w2', 'w3'], finalSubmitted: false, lastActive: new Date('2026-02-19T14:35:00') },
];

// Mock Worlds
export const mockWorlds: World[] = [
  { id: 'w1', title: 'The Victorian Manor', story: 'You find yourself at the entrance of an old Victorian manor...', question: 'What is hidden behind the portrait?', answer: 'key', order: 1, isLocked: false },
  { id: 'w2', title: 'The Cryptic Library', story: 'Dusty books line the shelves of this ancient library...', question: 'Which book reveals the secret passage?', answer: 'shakespeare', order: 2, isLocked: false },
  { id: 'w3', title: 'The Midnight Garden', story: 'Under the pale moonlight, shadows dance across the garden...', question: 'What flower blooms at midnight?', answer: 'moonflower', order: 3, isLocked: true },
  { id: 'w4', title: 'The Clock Tower', story: 'The ancient clock tower stands silent, its hands frozen in time...', question: 'What time reveals the truth?', answer: '11:47', order: 4, isLocked: true },
  { id: 'w5', title: 'The Final Chamber', story: 'You have reached the heart of the mystery...', question: 'Who orchestrated the grand deception?', answer: 'butler', order: 5, isLocked: true },
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  { id: 'a1', message: 'Welcome to SherlockIT 2.0! The mystery begins now...', createdAt: new Date('2026-02-19T10:00:00') },
  { id: 'a2', message: 'Hint: Look closely at the paintings in World 1', createdAt: new Date('2026-02-19T11:30:00') },
  { id: 'a3', message: 'World 3 is now UNLOCKED! The midnight garden awaits...', createdAt: new Date('2026-02-19T13:00:00') },
];

// Mock Final Submissions
export const mockFinalSubmissions: FinalSubmission[] = [
  { id: 'fs1', teamId: '2', teamName: 'Mystery Solvers', realWorld: 'The Clock Tower', villain: 'Professor Blackwood', weapon: 'Poison', submittedAt: new Date('2026-02-19T14:30:00') },
  { id: 'fs2', teamId: '4', teamName: 'The Sleuths', realWorld: 'The Victorian Manor', villain: 'Lady Winchester', weapon: 'Letter Opener', submittedAt: new Date('2026-02-19T14:45:00') },
];

// Mock Event Control
export const mockEventControl: EventControl = {
  finalAnswerOpen: false,
  finalAnswerStartTime: null,
};

// Mock Progress Data
export const mockProgress: Progress[] = [
  { teamId: '1', teamName: 'The Detectives', worldId: 'w1', worldTitle: 'The Victorian Manor', attempts: 3, completedAt: new Date('2026-02-19T11:15:00') },
  { teamId: '1', teamName: 'The Detectives', worldId: 'w2', worldTitle: 'The Cryptic Library', attempts: 5, completedAt: new Date('2026-02-19T12:30:00') },
  { teamId: '2', teamName: 'Mystery Solvers', worldId: 'w1', worldTitle: 'The Victorian Manor', attempts: 1, completedAt: new Date('2026-02-19T10:30:00') },
  { teamId: '2', teamName: 'Mystery Solvers', worldId: 'w2', worldTitle: 'The Cryptic Library', attempts: 2, completedAt: new Date('2026-02-19T11:00:00') },
  { teamId: '2', teamName: 'Mystery Solvers', worldId: 'w3', worldTitle: 'The Midnight Garden', attempts: 4, completedAt: new Date('2026-02-19T13:45:00') },
  { teamId: '3', teamName: 'Code Breakers', worldId: 'w1', worldTitle: 'The Victorian Manor', attempts: 8, completedAt: new Date('2026-02-19T12:00:00') },
  { teamId: '4', teamName: 'The Sleuths', worldId: 'w1', worldTitle: 'The Victorian Manor', attempts: 2, completedAt: new Date('2026-02-19T10:45:00') },
  { teamId: '4', teamName: 'The Sleuths', worldId: 'w2', worldTitle: 'The Cryptic Library', attempts: 1, completedAt: new Date('2026-02-19T11:15:00') },
  { teamId: '4', teamName: 'The Sleuths', worldId: 'w3', worldTitle: 'The Midnight Garden', attempts: 2, completedAt: new Date('2026-02-19T13:30:00') },
  { teamId: '4', teamName: 'The Sleuths', worldId: 'w4', worldTitle: 'The Clock Tower', attempts: 3, completedAt: new Date('2026-02-19T14:30:00') },
  { teamId: '6', teamName: 'Enigma Squad', worldId: 'w1', worldTitle: 'The Victorian Manor', attempts: 4, completedAt: new Date('2026-02-19T11:30:00') },
  { teamId: '6', teamName: 'Enigma Squad', worldId: 'w2', worldTitle: 'The Cryptic Library', attempts: 6, completedAt: new Date('2026-02-19T12:45:00') },
  { teamId: '6', teamName: 'Enigma Squad', worldId: 'w3', worldTitle: 'The Midnight Garden', attempts: 3, completedAt: new Date('2026-02-19T14:00:00') },
];
