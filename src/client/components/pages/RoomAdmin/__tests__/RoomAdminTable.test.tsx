import React from 'react';
import {
  deepStrictEqual,
  strictEqual,
} from 'assert';
import {
  fireEvent,
  RenderResult,
  wait,
  within,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import { render } from 'test-utils';
import { LocationAPI } from 'client/api';
import {
  adminRoomsResponse,
  bauerRoomResponse,
  error,
  oxfordRoomResponse,
  secRoomResponse,
} from 'testData';
import RoomAdmin from '../RoomAdmin';

describe('Campus Dropdown', function () {
  let getStub: SinonStub;
  let renderResult: RenderResult;
  beforeEach(function () {
    getStub = stub(LocationAPI, 'getAdminRooms');
    getStub.resolves(adminRoomsResponse);
    renderResult = render(
      <RoomAdmin />
    );
  });
  it('defaults to all', async function () {
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const campusDropDown = renderResult.getByLabelText('Change to filter the list of rooms by campus', { exact: true }) as HTMLSelectElement;
    strictEqual(campusDropDown.value, 'All');
  });
  context('When the campus dropdown menu is selected', function () {
    it('lists all available campus options', function () {
      const campusDropDown = renderResult.getByLabelText('Change to filter the list of rooms by campus');
      const dropdownOptions = within(campusDropDown)
        .getAllByRole('option') as HTMLOptionElement[];
      const campusDropdownLabels = dropdownOptions
        .map(({ textContent }) => textContent);
      deepStrictEqual(
        campusDropdownLabels,
        ['All', 'Allston', 'Cambridge']
      );
    });
  });
  context('When campus dropdown value changes', function () {
    it('filteres table data when Allston selected', async function () {
      await wait(() => renderResult.getAllByRole('row').length > 1);
      const [campusDropDown] = renderResult.getAllByLabelText('Change to filter the list of rooms by campus');
      fireEvent.change(campusDropDown, { target: { value: 'Allston' } });
      await wait(() => renderResult.getAllByRole('row').length > 1);
      const rows = renderResult.getAllByRole('row');
      const bodyRow = rows.filter((row) => (
        within(row).queryAllByRole('columnheader').length === 0
      ));
      bodyRow.forEach((row) => {
        strictEqual(
          within(row).queryByText('Allston') !== null,
          true,
          'Allston is not in the table as expected'
        );
      });
    });
    it('filters table data when Cambridge is selected', async function () {
      await wait(() => renderResult.getAllByRole('row').length > 1);
      const [campusDropDown] = renderResult.getAllByLabelText('Change to filter the list of rooms by campus');
      fireEvent.change(campusDropDown, { target: { value: 'Cambridge' } });
      await wait(() => renderResult.getAllByRole('row').length > 1);
      const rows = renderResult.getAllByRole('row');
      const bodyRow = rows.filter((row) => (
        within(row).queryAllByRole('columnheader').length === 0
      ));
      bodyRow.forEach((row) => {
        strictEqual(
          within(row).queryByText('Cambridge') !== null,
          true,
          'Cambridge is not in the table as expected'
        );
      });
    });
  });
});
describe('Building Dropdown', function () {
  let getStub: SinonStub;
  let renderResult: RenderResult;
  beforeEach(function () {
    getStub = stub(LocationAPI, 'getAdminRooms');
    getStub.resolves(adminRoomsResponse);
    renderResult = render(
      <RoomAdmin />
    );
  });
  it('defaults to all', async function () {
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const buildingDropDown = renderResult.getByLabelText('Change to filter the list of rooms by building', { exact: true }) as HTMLSelectElement;
    strictEqual(buildingDropDown.value, 'All');
  });
  it('lists all available building options', async function () {
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const buildingDropDown = renderResult.getByLabelText('Change to filter the list of rooms by building');
    const dropdownOptions = within(buildingDropDown)
      .getAllByRole('option') as HTMLOptionElement[];
    const buildingDropdownLabels = dropdownOptions
      .map(({ textContent }) => textContent);
    const buildingList = adminRoomsResponse.map((el) => el.building.name);
    // slicing 'All' value as it's manually added default value not generated from adminRoomsResponse
    strictEqual(
      buildingDropdownLabels.slice(1).length === buildingList.length, true,
      'building dropdown menu is not listing all available buildings'
    );
  });
  context('when building dropdown value changes', function () {
    it('filters table data for selected value', async function () {
      await wait(() => renderResult.getAllByRole('row').length > 1);
      const [buildingDropDown] = renderResult.getAllByLabelText('Change to filter the list of rooms by building');
      const testBuilding = adminRoomsResponse[0].building.name;
      fireEvent.change(buildingDropDown, {
        target:
        { value: testBuilding },
      });
      await wait(() => renderResult.getAllByRole('row').length > 1);
      const rows = renderResult.getAllByRole('row');
      const bodyRow = rows.filter((row) => (
        within(row).queryAllByRole('columnheader').length === 0
      ));
      bodyRow.forEach((row) => {
        strictEqual(
          within(row).queryByText(`${testBuilding}`) !== null,
          true,
          `${testBuilding} is not in the table as expected`
        );
      });
    });
  });
});
describe('Room input filter', function () {
  let getStub: SinonStub;
  let renderResult: RenderResult;
  beforeEach(function () {
    getStub = stub(LocationAPI, 'getAdminRooms');
    getStub.resolves(adminRoomsResponse);
    renderResult = render(
      <RoomAdmin />
    );
  });
  it('defaults to null', async function () {
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const roomFilterInput = renderResult.getByLabelText('Change to filter the list of rooms by selected room', { exact: true }) as HTMLSelectElement;
    strictEqual(roomFilterInput.value, '');
  });
  it('filters table data when room name is entered', async function () {
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const [roomInput] = renderResult.getAllByLabelText('Change to filter the list of rooms by selected room');
    const testRoomName = adminRoomsResponse[0].name;
    fireEvent.change(roomInput, { target: { value: testRoomName } });
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const rows = renderResult.getAllByRole('row');
    const bodyRow = rows.filter((row) => (
      within(row).queryAllByRole('columnheader').length === 0
    ));
    bodyRow.forEach((row) => {
      strictEqual(
        within(row).queryByText(`${testRoomName}`) !== null,
        true,
        `${testRoomName} is not in the table as expected`
      );
    });
  });
});
describe('capacity input filter', function () {
  let getStub: SinonStub;
  let renderResult: RenderResult;
  beforeEach(function () {
    getStub = stub(LocationAPI, 'getAdminRooms');
    getStub.resolves(adminRoomsResponse);
    renderResult = render(
      <RoomAdmin />
    );
  });
  it('defaults to null', async function () {
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const capacityFilterInput = renderResult.getByLabelText('Change to filter the list of rooms by capacity', { exact: true }) as HTMLSelectElement;
    strictEqual(capacityFilterInput.value, '');
  });
  it('filters table data by entered capacity entered', async function () {
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const [capacityFilterInput] = renderResult.getAllByLabelText('Change to filter the list of rooms by capacity');
    const testCapacity = adminRoomsResponse[0].capacity;
    fireEvent.change(capacityFilterInput, { target: { value: testCapacity } });
    await wait(() => renderResult.getAllByRole('row').length > 1);
    const rows = Array.from(renderResult.getAllByRole('row')) as HTMLTableRowElement[];
    const rowsContent = rows
      .map((el) => (Array.from(el.cells).map((i) => i.textContent)));
    strictEqual(
      parseInt(rowsContent[2][3]) === testCapacity,
      true,
      'room capacity filter is not populating data properly'
    );
  });
});
describe('Room Admin Table', function () {
  let getStub: SinonStub;
  describe('data fetching', function () {
    context('when room data fetch succeeds', function () {
      beforeEach(function () {
        getStub = stub(LocationAPI, 'getAdminRooms');
        getStub.resolves(adminRoomsResponse);
      });
      context('when there are room records', function () {
        it('displays one table row per room', async function () {
          const { getAllByRole } = render(
            <RoomAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          // The "+2" takes the table headers into account for the number of rows
          strictEqual(rows.length, adminRoomsResponse.length + 2);
        });
        it('displays the correct content in the table cells', async function () {
          const { getAllByRole } = render(
            <RoomAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          // slicing the first 2 headers as the filters are now added
          const rows = getAllByRole('row').slice(2) as HTMLTableRowElement[];
          [
            [
              secRoomResponse.name,
              secRoomResponse.building.name,
              secRoomResponse.building.campus.name,
              secRoomResponse.capacity.toString(),
            ],
            [
              oxfordRoomResponse.name,
              oxfordRoomResponse.building.name,
              oxfordRoomResponse.building.campus.name,
              oxfordRoomResponse.capacity.toString(),
            ],
            [
              bauerRoomResponse.name,
              bauerRoomResponse.building.name,
              bauerRoomResponse.building.campus.name,
              bauerRoomResponse.capacity.toString(),
            ],
          ].forEach((roomData, index) => {
            roomData.forEach((data) => {
              strictEqual(
                within(rows[index]).queryByText(data) !== null,
                true,
                `${data} is not in the table as expected`
              );
            });
          });
        });
      });
      context('when there are no room records', function () {
        const emptyTestData = [];
        beforeEach(function () {
          getStub.resolves(emptyTestData);
        });
        it('displays only the header row', async function () {
          const { getAllByRole } = render(
            <RoomAdmin />
          );
          await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
          const rows = getAllByRole('row');
          // With the filter, there are two table header rows
          strictEqual(rows.length, emptyTestData.length + 2);
        });
      });
    });
    context('when room data fetch fails', function () {
      let dispatchMessage: SinonStub;
      beforeEach(function () {
        dispatchMessage = stub();
        getStub = stub(LocationAPI, 'getAdminRooms');
        getStub.rejects(error);
      });
      afterEach(function () {
        getStub.restore();
      });
      it('should throw an error', async function () {
        const { findByText } = render(
          <RoomAdmin />,
          { dispatchMessage }
        );

        await findByText('Fetching Room Data');
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
