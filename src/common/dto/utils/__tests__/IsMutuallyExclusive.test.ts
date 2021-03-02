import { validate, IsNotEmpty } from 'class-validator';
import { strictEqual, deepStrictEqual } from 'assert';
import IsMutuallyExclusiveWith from '../IsMutuallyExclusiveWith';

describe('IsMutuallyExclusiveWith Validation Decorator', function () {
  context('With only one field mutually exclusive of another', function () {
    class OneMutuallyExclusive {
      @IsMutuallyExclusiveWith(['propertyTwo'])
      public propertyOne: string;

      public propertyTwo: string;
    }
    let testClass: OneMutuallyExclusive;
    context('With both fields defined', function () {
      beforeEach(function () {
        testClass = new OneMutuallyExclusive();
        testClass.propertyOne = 'foo';
        testClass.propertyTwo = 'bar';
      });
      it('Should generate one error', async function () {
        const errors = await validate(testClass);
        strictEqual(errors.length, 1);
        deepStrictEqual(Object.keys(errors[0].constraints), ['isMutuallyExclusiveWith']);
      });
    });
    context('With no fields defined', function () {
      beforeEach(function () {
        testClass = new OneMutuallyExclusive();
      });
      it('Should throw one error', async function () {
        const errors = await validate(testClass);
        strictEqual(errors.length, 1);
        deepStrictEqual(Object.keys(errors[0].constraints), ['isMutuallyExclusiveWith']);
      });
    });
    context('With only one field defined', function () {
      context('propertyOne (decorated)', function () {
        beforeEach(function () {
          testClass = new OneMutuallyExclusive();
          testClass.propertyOne = 'foo';
        });
        it('Should not generate any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
      context('propertyTwo (undecorated)', function () {
        beforeEach(function () {
          testClass = new OneMutuallyExclusive();
          testClass.propertyTwo = 'bar';
        });
        it('Should not throw any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
    });
  });
  context('With two mutually exclusive fields', function () {
    class TwoMutuallyExclusive {
      @IsMutuallyExclusiveWith(['propertyTwo'])
      public propertyOne: string;

      @IsMutuallyExclusiveWith(['propertyOne'])
      public propertyTwo: string;
    }
    let testClass: TwoMutuallyExclusive;
    context('With both fields defined', function () {
      beforeEach(function () {
        testClass = new TwoMutuallyExclusive();
        testClass.propertyOne = 'foo';
        testClass.propertyTwo = 'bar';
      });
      it('Should register two validation errors', async function () {
        const errors = await validate(testClass);
        strictEqual(errors.length, 2);
        deepStrictEqual(Object.keys(errors[0].constraints), ['isMutuallyExclusiveWith']);
        deepStrictEqual(Object.keys(errors[1].constraints), ['isMutuallyExclusiveWith']);
      });
    });
    context('With no fields defined', function () {
      beforeEach(function () {
        testClass = new TwoMutuallyExclusive();
      });
      it('should register two validation errors', async function () {
        const errors = await validate(testClass);
        strictEqual(errors.length, 2);
        deepStrictEqual(Object.keys(errors[0].constraints), ['isMutuallyExclusiveWith']);
        deepStrictEqual(Object.keys(errors[1].constraints), ['isMutuallyExclusiveWith']);
      });
    });
    context('With one field defined', function () {
      context('propertyOne', function () {
        beforeEach(function () {
          testClass = new TwoMutuallyExclusive();
          testClass.propertyOne = 'foo';
        });
        it('Should not register any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
      context('propertyTwo', function () {
        beforeEach(function () {
          testClass = new TwoMutuallyExclusive();
          testClass.propertyTwo = 'foo';
        });
        it('Should not register any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
    });
  });
  context('With multiple mutually exclusive fields', function () {
    class MultipleMutuallyExclusive {
      @IsMutuallyExclusiveWith(['propertyTwo', 'propertyThree'])
      public propertyOne: string;

      @IsMutuallyExclusiveWith(['propertyOne', 'propertyThree'])
      public propertyTwo: string;

      @IsMutuallyExclusiveWith(['propertyOne', 'propertyTwo'])
      public propertyThree: string;
    }
    let testClass: MultipleMutuallyExclusive;
    context('With all fields defined', function () {
      beforeEach(function () {
        testClass = new MultipleMutuallyExclusive();
        testClass.propertyOne = 'foo';
        testClass.propertyTwo = 'bar';
        testClass.propertyThree = 'baz';
      });
      it('Should register a validation error for each', async function () {
        const errors = await validate(testClass);
        strictEqual(errors.length, 3);
        deepStrictEqual(Object.keys(errors[0].constraints), ['isMutuallyExclusiveWith']);
        deepStrictEqual(Object.keys(errors[1].constraints), ['isMutuallyExclusiveWith']);
        deepStrictEqual(Object.keys(errors[2].constraints), ['isMutuallyExclusiveWith']);
      });
    });
    context('With no fields defined', function () {
      beforeEach(function () {
        testClass = new MultipleMutuallyExclusive();
      });
      it('should register a validation errors', async function () {
        const errors = await validate(testClass);
        strictEqual(errors.length, 3);
        deepStrictEqual(Object.keys(errors[0].constraints), ['isMutuallyExclusiveWith']);
        deepStrictEqual(Object.keys(errors[1].constraints), ['isMutuallyExclusiveWith']);
        deepStrictEqual(Object.keys(errors[2].constraints), ['isMutuallyExclusiveWith']);
      });
    });
    context('With one field defined', function () {
      context('propertyOne', function () {
        beforeEach(function () {
          testClass = new MultipleMutuallyExclusive();
          testClass.propertyOne = 'foo';
        });
        it('Should not register any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
      context('propertyTwo', function () {
        beforeEach(function () {
          testClass = new MultipleMutuallyExclusive();
          testClass.propertyTwo = 'foo';
        });
        it('Should not register any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
      context('propertyThree', function () {
        beforeEach(function () {
          testClass = new MultipleMutuallyExclusive();
          testClass.propertyThree = 'foo';
        });
        it('Should not register any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
    });
  });
  context('Combined with other validators', function () {
    class WithOtherValidators {
      @IsMutuallyExclusiveWith(['propertyTwo'])
      @IsNotEmpty()
      propertyOne: string;

      @IsMutuallyExclusiveWith(['propertyOne'])
      @IsNotEmpty()
      propertyTwo: string;
    }

    let testClass: WithOtherValidators;
    context('With both fields defined', function () {
      context('passing other validation', function () {
        beforeEach(function () {
          testClass = new WithOtherValidators();
          testClass.propertyOne = 'foo';
          testClass.propertyTwo = 'bar';
        });
        it('Should generate only two IsMutuallyExclusiveWith errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 2);
          deepStrictEqual(Object.keys(errors[0].constraints), ['isMutuallyExclusiveWith']);
          deepStrictEqual(Object.keys(errors[1].constraints), ['isMutuallyExclusiveWith']);
        });
      });
      context('failing other validation', function () {
        beforeEach(function () {
          testClass = new WithOtherValidators();
          testClass.propertyOne = '';
          testClass.propertyTwo = '';
        });
        it('Should generate two errors with both validators', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 2);
          deepStrictEqual(Object.keys(errors[0].constraints), ['isNotEmpty', 'isMutuallyExclusiveWith']);
          deepStrictEqual(Object.keys(errors[1].constraints), ['isNotEmpty', 'isMutuallyExclusiveWith']);
        });
      });
    });
    context('With no fields defined', function () {
      beforeEach(function () {
        testClass = new WithOtherValidators();
      });
      it('Should generate all validation errors', async function () {
        const errors = await validate(testClass);
        strictEqual(errors.length, 2);
        deepStrictEqual(Object.keys(errors[0].constraints), ['isNotEmpty', 'isMutuallyExclusiveWith']);
        deepStrictEqual(Object.keys(errors[1].constraints), ['isNotEmpty', 'isMutuallyExclusiveWith']);
      });
    });
    context('With only one field defined', function () {
      context('passing other validation', function () {
        beforeEach(function () {
          testClass = new WithOtherValidators();
          testClass.propertyOne = 'foo';
        });
        it('Should not generate any errors', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 0);
        });
      });
      context('failing other validation', function () {
        beforeEach(function () {
          testClass = new WithOtherValidators();
          testClass.propertyOne = '';
        });
        it('Should generate only one error for the other validator', async function () {
          const errors = await validate(testClass);
          strictEqual(errors.length, 1);
          deepStrictEqual(Object.keys(errors[0].constraints), ['isNotEmpty']);
        });
      });
    });
  });
});
