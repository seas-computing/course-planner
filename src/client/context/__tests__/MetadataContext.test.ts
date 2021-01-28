import * as dummy from 'testData';
import { MetadataContextValue } from 'client/context';
import { strictEqual } from 'assert';

describe('Metadata Context', function () {
  let currentMetadata = dummy.metadata;
  const metadataContext = new MetadataContextValue(
    currentMetadata, (metadata) => {
      currentMetadata = metadata;
    }
  );
  it('returns the current academic year', function () {
    strictEqual(
      metadataContext.currentAcademicYear,
      dummy.metadata.currentAcademicYear
    );
  });
  it('returns the areas', function () {
    strictEqual(
      metadataContext.areas,
      dummy.metadata.areas
    );
  });
  it('returns the semesters', function () {
    strictEqual(
      metadataContext.semesters,
      dummy.metadata.semesters
    );
  });
});
