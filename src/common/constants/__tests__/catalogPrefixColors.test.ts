import { strictEqual } from 'assert';
import CATALOG_PREFIX_COLORS, {getCatPrefixColor} from '../catalogPrefixColors';

describe('getCatPrefixColor', function () {
  context('CATALOG_PREFIX_COLORS.AC', function () {
    it('Should return "#da373e"', function () {
      strictEqual(getCatPrefixColor(CATALOG_PREFIX_COLORS.AC), '#da373e');
    });
  });
  context('CATALOG_PREFIX_COLORS.AM', function () {
    it('Should return "#4eadab"', function () {
      strictEqual(getCatPrefixColor(CATALOG_PREFIX_COLORS.AM), '#4eadab');
    });
  });
  context('Any other value', function () {
    it('should return "#95b5df"', function () {
      strictEqual(getCatPrefixColor(CATALOG_PREFIX_COLORS.General), '#95b5df');
    });
  });
});
