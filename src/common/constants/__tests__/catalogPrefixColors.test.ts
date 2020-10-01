import { strictEqual } from 'assert';
import CATALOG_PREFIX_COLORS, { getCatPrefixColor } from '../catalogPrefixColors';

describe('getCatPrefixColor', function () {
  context('CATALOG_PREFIX_COLORS.AC', function () {
    it('Should return "#da373e"', function () {
      strictEqual(getCatPrefixColor('AC'), CATALOG_PREFIX_COLORS.AC);
    });
  });
  context('CATALOG_PREFIX_COLORS.AM', function () {
    it('Should return "#4eadab"', function () {
      strictEqual(getCatPrefixColor('AM'), CATALOG_PREFIX_COLORS.AM);
    });
  });
  context('CATALOG_PREFIX_COLORS.AP', function () {
    it('should return "#cedb51" ', function () {
      strictEqual(getCatPrefixColor('AP'), CATALOG_PREFIX_COLORS.AP);
    });
  });
  context('CATALOG_PREFIX_COLORS.BE', function () {
    it('should return "#f0b643" ', function () {
      strictEqual(getCatPrefixColor('BE'), CATALOG_PREFIX_COLORS.BE);
    });
  });
  context('CATALOG_PREFIX_COLORS.CS', function () {
    it('should return "#6797db" ', function () {
      strictEqual(getCatPrefixColor('CS'), CATALOG_PREFIX_COLORS.CS);
    });
  });
  context('CATALOG_PREFIX_COLORS.EPS', function () {
    it('should return "#946EB7" ', function () {
      strictEqual(getCatPrefixColor('EPS'), CATALOG_PREFIX_COLORS.EPS);
    });
  });
  context('CATALOG_PREFIX_COLORS.ES', function () {
    it('should return "#f9df57" ', function () {
      strictEqual(getCatPrefixColor('ES'), CATALOG_PREFIX_COLORS.ES);
    });
  });
  context('CATALOG_PREFIX_COLORS.ESE', function () {
    it('should return "#75c3d5" ', function () {
      strictEqual(getCatPrefixColor('ESE'), CATALOG_PREFIX_COLORS.ESE);
    });
  });
  context('CATALOG_PREFIX_COLORS.SEMINAR', function () {
    it('should return "#ec8f9c" ', function () {
      strictEqual(getCatPrefixColor('SEMINAR'), CATALOG_PREFIX_COLORS.SEMINAR);
    });
  });
  context('CATALOG_PREFIX_COLORS.GenEd', function () {
    it('should return "#c0c0c0" ', function () {
      strictEqual(getCatPrefixColor('GenEd'), CATALOG_PREFIX_COLORS.GenEd);
    });
  });
  context('CATALOG_PREFIX_COLORS.FRSEMR', function () {
    it('should return "#c0c0c0" ', function () {
      strictEqual(getCatPrefixColor('FRSEMR'), CATALOG_PREFIX_COLORS.FRSEMR);
    });
  });
  context('Any other value', function () {
    it('should return "#95b5df"', function () {
      strictEqual(getCatPrefixColor('anythingelse'), CATALOG_PREFIX_COLORS.General);
    });
  });
});
