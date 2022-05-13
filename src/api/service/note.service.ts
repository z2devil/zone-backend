import { FilterQuery } from 'mongoose';
import NoteModel, { NoteDocument } from '../models/note.model';
import { BaseCrudProvider } from '../common';

const CRUD = BaseCrudProvider<NoteDocument, Omit<NoteDocument, 'createdAt'>>(
    NoteModel
);

export default CRUD;

/**
 * 查找笔记
 */
export const findNotes = async (params: FilterQuery<NoteDocument>) => {
    return await NoteModel.find(
        {
            ...params,
            isDeleted: false,
        },
        ['content', 'createdAt', 'author'],
        {
            sort: { createdAt: -1 },
        }
    ).populate('author', ['email', 'nickname', 'lv', 'avatarPath']);
};
