import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface RoleDocument extends BaseDocument {
  name: string;
  description: string;
  permissions: mongoose.Schema.Types.ObjectId[];
}

const roleSchema = schemaFactory({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: false },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
});

const RoleModel = mongoose.model<RoleDocument>('Role', roleSchema);

export default RoleModel;
