import { ContextIdFactory } from '@nestjs/core';
import { strictEqual } from 'assert';
import TERM_PATTERN, {termPatternEnumToString } from '../termPattern';

describe.only('termPatternEnumToString', function () {
  context('TERM_PATTERN.BOTH', function () {
    it('Should return "Both"', function () {
      strictEqual(termPatternEnumToString(TERM_PATTERN.BOTH), 'Both');
    });
  });
  context('TERM_PATTERN.FALL', function () {
    it('Should return "Fall"', function () {
      strictEqual(termPatternEnumToString(TERM_PATTERN.FALL), 'Fall');
    });
  });
  context('TERM_PATTERN.SPRING', function () {
    it('Should return "Spring"', function () {
      strictEqual(termPatternEnumToString(TERM_PATTERN.SPRING), 'Spring');
    });
  });
});
