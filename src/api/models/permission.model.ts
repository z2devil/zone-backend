import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface PermissionDocument extends BaseDocument {
  name: string;
  description: string;
}

const permissionSchema = schemaFactory({
  name: { type: String, required: true },
  description: { type: String, required: false },
});

const PermissionModel = mongoose.model<PermissionDocument>(
  'Permission',
  permissionSchema
);

export default PermissionModel;
