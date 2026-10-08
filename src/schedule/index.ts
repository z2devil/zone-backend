import cron from 'node-cron';
import { findPublicNotesForStatistics } from '../api/service/note.service';
import { StatisticsDocument } from '../api/models/statistics.model';
import { collect } from '../api/service/statistics.service';
import logger from '../utils/logger';

let statisticsTask: cron.ScheduledTask | undefined;

const HOUR_MS = 60 * 60 * 1000;

export const collectStatistics = async (now = new Date()) => {
  const startedAt = Date.now();
  const notes = await findPublicNotesForStatistics();
  const noteCount = notes.length;
  const wordCount = notes.reduce((prev, curr) => prev + curr.content.length, 0);
  const viewCount = notes.reduce(
    (prev, curr) => prev + (curr.viewCount || 0),
    0
  );
  const contributes: StatisticsDocument['contributes'] = [];
  notes.forEach(note => {
    const date = new Date(note.createdAt);
    const day = new Date(date.toISOString().split('T')[0]).getTime();

    const dayIndex = contributes.findIndex(item => item.date === day);
    if (dayIndex === -1) {
      contributes.push({ date: day, count: 1 });
    } else {
      contributes[dayIndex].count++;
    }
  });
  await collect({
    period: Math.floor(now.getTime() / HOUR_MS) * HOUR_MS,
    collectedAt: now,
    wordCount,
    noteCount,
    viewCount,
    likeCount: 0,
    contributes,
  });
  logger.info(
    {
      event: 'statistics_collection_finished',
      note_count: noteCount,
      duration_ms: Date.now() - startedAt,
      success: true,
    },
    'Statistics collection finished'
  );
};

export function startSchedules() {
  if (statisticsTask) return;
  statisticsTask = cron.schedule('0 * * * *', () => {
    collectStatistics().catch(error => {
      logger.error(
        {
          event: 'statistics_collection_finished',
          error_type: error instanceof Error ? error.name : 'unknown',
          success: false,
        },
        'Statistics collection failed'
      );
    });
  });
}

export function stopSchedules() {
  statisticsTask?.stop();
  statisticsTask = undefined;
}
