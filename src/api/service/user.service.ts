import { BaseCrudProvider } from '../../utils';
import UserModel, { UserDocument } from '../models/user.model';

const CRUD = BaseCrudProvider<UserDocument, Omit<UserDocument, 'createdAt'>>(
    UserModel
);

export default CRUD;
