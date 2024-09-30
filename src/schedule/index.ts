import cron from 'node-cron';
import { default as NodeCRUD } from '../api/service/note.service';
import { StatisticsDocument } from '../api/models/statistics.model';
import { collect } from '../api/service/statistics.service';

const collectData = async () => {
  console.log('统计数据:', new Date());
  const notes = await NodeCRUD.find({
    isDeleted: false,
  });
  const noteCount = notes.length;
  const wordCount = notes.reduce((prev, curr) => prev + curr.content.length, 0);
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
    wordCount,
    noteCount,
    viewCount: 0,
    likeCount: 0,
    contributes,
  });
};

cron.schedule('0 * * * *', () => {
  collectData();
});
