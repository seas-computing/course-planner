import React from 'react';
import { render, within, fireEvent } from 'test-utils';
import { strictEqual, deepStrictEqual } from 'assert';
import { stub } from 'sinon';
import * as dummy from 'testData';
import { useStoredState } from '../useStoredState';

describe('UseStoredState', function () {
  let fakeSessionStorage: Storage;
  let fakeStorageMap: Map<string, string>;
  const testKey = 'testKey';
  const testValue = {
    string: 'testValue',
    array: ['a', 'b', 'c'],
  };
  const StorageDemo = () => {
    const [testData, setTestData] = useStoredState(testKey, testValue);
    return (
      <div>
        <ul>
          <li>{`Test String Value:${testData.string}`}</li>
          <li>
            Test Array Values
            <ul>
              {testData.array.map((val) => <li key={val}>{val}</li>)}
            </ul>
          </li>
        </ul>
        <label>
          Change Test String
          <input
            type="text"
            value={testValue.string}
            onChange={(evt) => {
              setTestData((old) => (
                {
                  ...old,
                  string: evt.target.value,
                }));
            }}
          />
        </label>
      </div>
    );
  };
  beforeEach(function () {
    fakeStorageMap = new Map();
    fakeSessionStorage = {
      setItem: (key, value) => { fakeStorageMap.set(key, value); },
      getItem: (key) => (
        fakeStorageMap.has(key)
          ? fakeStorageMap.get(key)
          : null
      ),
      removeItem: (key) => { fakeStorageMap.delete(key); },
      length: fakeStorageMap.size,
      clear: () => { fakeStorageMap.clear(); },
      key: (index) => {
        const values = fakeStorageMap.values();
        return values[index] as string;
      },
    };
  });
  context('With sessionStorage', function () {
    beforeEach(function () {
      stub(global.window, 'sessionStorage').get(() => fakeSessionStorage);
    });
    it('Will serialize the initial value in storage', function () {
      render(<StorageDemo />);
      strictEqual(fakeStorageMap.get('testKey'), JSON.stringify(testValue));
    });
    it('Will return the state value', function () {
      const page = render(<StorageDemo />);
      const testStringItem = page.getByText('Test String Value', { exact: false });
      const stateString = testStringItem.textContent.split(':')[1];
      strictEqual(stateString, testValue.string);
      const testArrayItems = within(page.getByText('Test Array Values')).getAllByRole('listitem');
      const stateArray = testArrayItems.map(({ textContent }) => textContent);
      deepStrictEqual(stateArray, testValue.array);
    });
    it('Will save updates in storage and state', function () {
      const page = render(<StorageDemo />);
      const input = page.getByLabelText('Change Test String');
      fireEvent.change(input, { target: { value: dummy.string } });
      const storedString = JSON.parse(fakeStorageMap.get(testKey)).string;
      strictEqual(storedString, dummy.string);
      const testStringItem = page.getByText('Test String Value', { exact: false });
      const stateString = testStringItem.textContent.split(':')[1];
      strictEqual(stateString, storedString);
    });
  });
  context('Without Session Storage', function () {
    beforeEach(function () {
      stub(global.window, 'sessionStorage').get(() => undefined);
    });
    it('Will return the state value', function () {
      const page = render(<StorageDemo />);
      const testStringItem = page.getByText('Test String Value', { exact: false });
      const stateString = testStringItem.textContent.split(':')[1];
      strictEqual(stateString, testValue.string);
      const testArrayItems = within(page.getByText('Test Array Values')).getAllByRole('listitem');
      const stateArray = testArrayItems.map(({ textContent }) => textContent);
      deepStrictEqual(stateArray, testValue.array);
    });
    it('Will save updates in state', function () {
      const page = render(<StorageDemo />);
      const input = page.getByLabelText('Change Test String');
      fireEvent.change(input, { target: { value: dummy.string } });
      const testStringItem = page.getByText('Test String Value', { exact: false });
      const stateString = testStringItem.textContent.split(':')[1];
      strictEqual(stateString, dummy.string);
    });
  });
});
