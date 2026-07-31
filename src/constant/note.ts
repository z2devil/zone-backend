export const NOTE_VISIBILITY = {
  public: 'public',
  private: 'private',
} as const;

export type NoteVisibility =
  (typeof NOTE_VISIBILITY)[keyof typeof NOTE_VISIBILITY];
