import assert from 'assert';
import {
  buildPublicNoteScope,
  buildReadableNoteScope,
  withNoteScope,
} from '../src/api/service/note.access';

assert.deepStrictEqual(buildReadableNoteScope(), {
  $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
});

assert.deepStrictEqual(buildReadableNoteScope('user-1'), {
  $or: [
    { visibility: 'public' },
    { visibility: { $exists: false } },
    { visibility: 'private', author: 'user-1' },
  ],
});

assert.deepStrictEqual(buildPublicNoteScope(), {
  $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
});

const search = {
  $or: [{ title: /secret/ }, { summary: /secret/ }],
  isDeleted: false,
};
assert.deepStrictEqual(
  withNoteScope(search, buildReadableNoteScope('user-1')),
  {
    $and: [search, buildReadableNoteScope('user-1')],
  }
);

console.log('note access contract: passed');
