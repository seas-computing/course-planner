import { Test, TestingModule } from '@nestjs/testing';
import React from 'react';
import {
  stub,
} from 'sinon';
import {
  RenderResult,
  fireEvent,
  waitForElementToBeRemoved,
  render,
  within,
  waitForElement,
} from '@testing-library/react';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import request from 'client/api/request';
import { SessionModule } from 'nestjs-session';
import * as dummy from 'testData';
import { UserController } from 'server/user/user.controller';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import { notStrictEqual, strictEqual } from 'assert';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE } from 'common/constants';
import { LocationModule } from 'server/location/location.module';
import { MetadataModule } from 'server/metadata/metadata.module';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { PopulationModule } from '../../mocks/database/population/population.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import mockAdapter from '../../mocks/api/adapter';
import { buildings, rooms } from '../../mocks/database/population/data';

describe('End-to-end Room Admin updating', function () {
  let testModule: TestingModule;
  beforeEach(async function () {
    stub(TestingStrategy.prototype, 'login').resolves(dummy.adminUser);
    const fakeConfig = new ConfigService(this.database.connectionEnv);
    testModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: dummy.safeString,
            resave: true,
            saveUninitialized: true,
          },
        }),
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (
            config: ConfigService
          ): TypeOrmModuleOptions => ({
            ...config.dbOptions,
            synchronize: true,
            autoLoadEntities: true,
            retryAttempts: 10,
            retryDelay: 10000,
          }),
          inject: [ConfigService],
        }),
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        PopulationModule,
        LocationModule,
        MetadataModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();
    const nestApp = await testModule
      .createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
    const api = nestApp.getHttpServer();
    request.defaults.adapter = mockAdapter(api);
  });
  afterEach(async function () {
    return testModule.close();
  });
  describe('Creating a course', function () {
    let renderResult: RenderResult;
    let campusSelect;
    let buildingSelect;
    let buildingInput;
    let roomNameInput;
    let capacityInput;
    beforeEach(async function () {
      renderResult = render(
        <MemoryRouter initialEntries={['/room-admin']}>
          <App />
        </MemoryRouter>
      );
      await renderResult.findAllByText(rooms[0].building, { exact: false });
    });
    context('when the modal opens', function () {
      beforeEach(async function () {
        const createRoomButton = await renderResult.findByText('Create New Room', { exact: false });
        fireEvent.click(createRoomButton);
        await renderResult.findByText('Note: * denotes a required field', { exact: false });
      });
      it('shifts the focus to the modal header', function () {
        strictEqual(document.activeElement.textContent, 'Create New Room');
      });
      context('when the campus dropdown is changed to "Allston"', function () {
        it('updates the building dropdown options to Allston buildings', function () {
          const testCampus = 'Allston';
          const modal = renderResult.getByRole('dialog');
          campusSelect = within(modal).getByLabelText('Campus', { exact: false }) as HTMLSelectElement;
          fireEvent.change(campusSelect,
            { target: { value: testCampus } });
          buildingSelect = within(modal).getByLabelText('Existing Building') as HTMLSelectElement;
          const options = within(buildingSelect).getAllByRole('option')
            .map(({ value }: HTMLOptionElement) => value);
          const allstonCampusBuildings = buildings
            .filter((building) => building.campus === testCampus)
            .map(({ name }) => name);
          allstonCampusBuildings.forEach((building) => strictEqual(
            options.includes(building),
            true
          ));
        });
      });
      context('when the campus dropdown is changed to "Cambridge"', function () {
        it('updates the building dropdown options to Cambridge buildings', function () {
          const testCampus = 'Cambridge';
          const modal = renderResult.getByRole('dialog');
          campusSelect = within(modal).getByLabelText('Campus', { exact: false }) as HTMLSelectElement;
          fireEvent.change(campusSelect,
            { target: { value: testCampus } });
          buildingSelect = within(modal).getByLabelText('Existing Building') as HTMLSelectElement;
          const options = within(buildingSelect).getAllByRole('option')
            .map(({ value }: HTMLOptionElement) => value);
          const allstonCampusBuildings = buildings
            .filter((building) => building.campus === testCampus)
            .map(({ name }) => name);
          allstonCampusBuildings.forEach((building) => strictEqual(
            options.includes(building),
            true
          ));
        });
      });
      context('when the required fields are not filled in', function () {
        beforeEach(function () {
          const submitButton = renderResult.getByText('Submit');
          fireEvent.click(submitButton);
        });
        context('when the Campus is not provided', function () {
          it('displays a validation error', function () {
            const errorMessage = 'Campus is required to submit this form';
            return waitForElement(
              () => renderResult.getByText(errorMessage, { exact: false })
            );
          });
        });
        context('when the Building is not provided', function () {
          it('displays a validation error', function () {
            const errorMessage = 'Building is required to submit this form';
            return waitForElement(
              () => renderResult.getByText(errorMessage, { exact: false })
            );
          });
        });
        context('when the Room Name is not provided', function () {
          it('displays a validation error', function () {
            const errorMessage = 'Room number is required to submit this form';
            return waitForElement(
              () => renderResult.getByText(errorMessage, { exact: false })
            );
          });
        });
        context('when the Capacity is not provided', function () {
          it('displays a validation error', function () {
            const errorMessage = 'Capacity is required to submit this form';
            return waitForElement(
              () => renderResult.getByText(errorMessage, { exact: false })
            );
          });
        });
      });
      context('when the required fields are filled in', function () {
        const testCampus = 'Allston';
        let existingRoom: string;
        beforeEach(function () {
          const modal = renderResult.getByRole('dialog');
          campusSelect = within(modal).getByLabelText('Campus', { exact: false }) as HTMLSelectElement;
          fireEvent.change(campusSelect,
            { target: { value: testCampus } });
          buildingInput = within(modal).getByLabelText('New Building') as HTMLInputElement;
          roomNameInput = within(modal).getByLabelText('Room Number', { exact: false }) as HTMLInputElement;
          capacityInput = within(modal).getByLabelText('Capacity', { exact: false }) as HTMLInputElement;
        });
        context('with an existing building', function () {
          context('with an existing room', function () {
            beforeEach(function () {
              buildingSelect = renderResult.getByLabelText('Existing Building') as HTMLSelectElement;
              const options = within(buildingSelect).getAllByRole('option')
                .map(({ value }: HTMLOptionElement) => value);
              const testBuilding = options[1];
              existingRoom = rooms
                .find((room) => room.building === testBuilding).name;
              fireEvent.change(buildingSelect,
                { target: { value: testBuilding } });
              fireEvent.change(roomNameInput,
                { target: { value: existingRoom } });
              fireEvent.change(capacityInput,
                { target: { value: 100 } });
            });
            context('when the user tries to exit the modal', function () {
              it('should show the unsaved changes warning', async function () {
                const windowConfirmStub = stub(window, 'confirm');
                windowConfirmStub.returns(true);
                // Attempt to close the modal without saving
                const cancelButton = await renderResult.findByText('Cancel');
                fireEvent.click(cancelButton);
                strictEqual(windowConfirmStub.callCount, 1);
              });
            });
            context('when the form is submitted', function () {
              it('displays an error indicating the room already exists', function () {
                const submitButton = renderResult.getByText('Submit');
                fireEvent.click(submitButton);
                const errorMessage = `The room ${existingRoom} already exists`;
                return waitForElement(
                  () => renderResult.getByText(errorMessage, { exact: false })
                );
              });
            });
          });
          context('with a new room', function () {
            beforeEach(function () {
              buildingSelect = renderResult.getByLabelText('Existing Building') as HTMLSelectElement;
              const options = within(buildingSelect).getAllByRole('option')
                .map(({ value }: HTMLOptionElement) => value);
              const testBuilding = options[1];
              existingRoom = rooms
                .find((room) => room.building === testBuilding).name;
              fireEvent.change(buildingSelect,
                { target: { value: testBuilding } });
              fireEvent.change(roomNameInput,
                { target: { value: existingRoom.concat('abc') } });
              fireEvent.change(capacityInput,
                { target: { value: 100 } });
            });
            context('when the user tries to exit the modal', function () {
              it('should show the unsaved changes warning', async function () {
                const windowConfirmStub = stub(window, 'confirm');
                windowConfirmStub.returns(true);
                // Attempt to close the modal without saving
                const cancelButton = await renderResult.findByText('Cancel');
                fireEvent.click(cancelButton);
                strictEqual(windowConfirmStub.callCount, 1);
              });
            });
            context('when the form is submitted', function () {
              it('should close the modal without an unsaved changes warning', async function () {
                const submitButton = renderResult.getByText('Submit');
                fireEvent.click(submitButton);
                await waitForElementToBeRemoved(() => renderResult.queryByText('Submit'));
                const modal = renderResult.queryByRole('dialog');
                strictEqual(modal, null);
              });
              it('should show a success message', async function () {
                const submitButton = renderResult.getByText('Submit');
                fireEvent.click(submitButton);
                await waitForElementToBeRemoved(() => renderResult.queryByText('Submit'));
                await waitForElementToBeRemoved(() => renderResult.queryByText('Fetching Room Data'));
                return renderResult.findByText('Room was added', { exact: false });
              });
              it('shifts the focus to the Create Room button', async function () {
                const submitButton = renderResult.getByText('Submit');
                fireEvent.click(submitButton);
                await waitForElementToBeRemoved(() => renderResult.queryByText('Submit'));
                await waitForElementToBeRemoved(() => renderResult.queryByText('Fetching Room Data'));
                strictEqual(document.activeElement.textContent, 'Create New Room');
              });
            });
          });
        });
        context('with a new building', function () {
          const newBuilding = 'newBuilding';
          context('with a new room', function () {
            beforeEach(function () {
              const newBuildingRadioButton = renderResult.getByLabelText('Create a new building', { exact: false });
              fireEvent.click(newBuildingRadioButton);
              fireEvent.change(buildingInput,
                { target: { value: newBuilding } });
              fireEvent.change(roomNameInput,
                { target: { value: '123newRoom' } });
              fireEvent.change(capacityInput,
                { target: { value: 100 } });
            });
            context('when the user tries to exit the modal', function () {
              it('should show the unsaved changes warning', async function () {
                const windowConfirmStub = stub(window, 'confirm');
                windowConfirmStub.returns(true);
                // Attempt to close the modal without saving
                const cancelButton = await renderResult.findByText('Cancel');
                fireEvent.click(cancelButton);
                strictEqual(windowConfirmStub.callCount, 1);
              });
            });
            context('when the form is submitted', function () {
              beforeEach(async function () {
                const submitButton = renderResult.getByText('Submit');
                fireEvent.click(submitButton);
                await waitForElementToBeRemoved(() => renderResult.queryByText('Submit'));
              });
              it('should close the modal without an unsaved changes warning', function () {
                const modal = renderResult.queryByRole('dialog');
                strictEqual(modal, null);
              });
              it('should show a success message', async function () {
                return renderResult.findByText('Room was added', { exact: false });
              });
              it('shifts the focus to the Create Room button', async function () {
                await waitForElementToBeRemoved(() => renderResult.queryByText('Fetching Room Data'));
                strictEqual(document.activeElement.textContent, 'Create New Room');
              });
              context('when the modal is reopened', function () {
                it('should include the new building', async function () {
                  await waitForElementToBeRemoved(() => renderResult.queryByText('Fetching Room Data'));
                  const createRoomButton = await renderResult.findByText('Create New Room', { exact: false });
                  fireEvent.click(createRoomButton);
                  await renderResult.findByText('Note: * denotes a required field', { exact: false });
                  const modal = renderResult.getByRole('dialog');
                  campusSelect = within(modal).getByLabelText('Campus', { exact: false }) as HTMLSelectElement;
                  fireEvent.change(campusSelect,
                    { target: { value: testCampus } });
                  buildingSelect = within(modal).getByLabelText('Existing Building') as HTMLSelectElement;
                  const options = within(buildingSelect).getAllByRole('option')
                    .map(({ value }: HTMLOptionElement) => value);
                  strictEqual(options.includes(newBuilding), true);
                });
              });
            });
          });
        });
        context('with an existing building entered into the new building field', function () {
          beforeEach(function () {
            // Find an existing building and populate that existing building
            // into the New Building field
            buildingSelect = renderResult.getByLabelText('Existing Building') as HTMLSelectElement;
            const options = within(buildingSelect).getAllByRole('option')
              .map(({ value }: HTMLOptionElement) => value);
            const testBuilding = options[1];
            const newBuildingRadioButton = renderResult.getByLabelText('Create a new building', { exact: false });
            fireEvent.click(newBuildingRadioButton);
            fireEvent.change(buildingInput,
              { target: { value: testBuilding.trim() } });
            fireEvent.change(roomNameInput,
              { target: { value: '100b' } });
            fireEvent.change(capacityInput,
              { target: { value: 100 } });
          });
          it('displays an error indicating the building already exists', function () {
            const submitButton = renderResult.getByText('Submit');
            fireEvent.click(submitButton);
            const errorMessage = renderResult.queryByText('This building already exists in the selected campus', { exact: false });
            notStrictEqual(errorMessage, null);
          });
        });
      });
    });
  });
  describe('Editing a room', function () {
    let renderResult: RenderResult;
    let roomNameInput;
    let capacityInput;
    beforeEach(async function () {
      renderResult = render(
        <MemoryRouter initialEntries={['/room-admin']}>
          <App />
        </MemoryRouter>
      );
      await renderResult.findAllByText(rooms[0].building, { exact: false });
    });
    context('when the modal opens', function () {
      const testRoom = rooms[0];
      beforeEach(async function () {
        const editButton = renderResult.getByLabelText(`Edit room information for ${testRoom.building} ${testRoom.name}`);
        fireEvent.click(editButton);
        await renderResult.findByText('Note: * denotes a required field', { exact: false });
      });
      it('shifts the focus to the modal header', function () {
        strictEqual(document.activeElement.textContent, `Edit room ${testRoom.building} ${testRoom.name}`);
      });
      context('when the field values provided are invalid', function () {
        beforeEach(function () {
          const modal = renderResult.getByRole('dialog');
          roomNameInput = within(modal).getByLabelText('Room Number', { exact: false }) as HTMLInputElement;
          capacityInput = within(modal).getByLabelText('Capacity', { exact: false }) as HTMLInputElement;
        });
        context('when Room Name is not provided', function () {
          it('displays a validation error', async function () {
            fireEvent.change(roomNameInput,
              { target: { value: '' } });
            const submitButton = renderResult.getByText('Submit');
            fireEvent.click(submitButton);
            const errorMessage = 'Room number is required to submit this form';
            return waitForElement(
              () => renderResult.getByText(errorMessage, { exact: false })
            );
          });
        });
        context('when Capacity is not provided', function () {
          it('displays a validation error', async function () {
            fireEvent.change(capacityInput,
              { target: { value: '' } });
            const submitButton = renderResult.getByText('Submit');
            fireEvent.click(submitButton);
            const errorMessage = 'Capacity is required to submit this form, and it must be a positive number';
            return waitForElement(
              () => renderResult.getByText(errorMessage, { exact: false })
            );
          });
        });
        context('when Capacity is invalid', function () {
          it('displays a validation error', async function () {
            fireEvent.change(capacityInput,
              { target: { value: '100z' } });
            const submitButton = renderResult.getByText('Submit');
            fireEvent.click(submitButton);
            const errorMessage = 'Capacity is required to submit this form, and it must be a positive number';
            return waitForElement(
              () => renderResult.getByText(errorMessage, { exact: false })
            );
          });
        });
      });
      context('when the field values provided are valid', function () {
        beforeEach(function () {
          const modal = renderResult.getByRole('dialog');
          roomNameInput = within(modal).getByLabelText('Room Number', { exact: false }) as HTMLInputElement;
          capacityInput = within(modal).getByLabelText('Capacity', { exact: false }) as HTMLInputElement;
          fireEvent.change(roomNameInput,
            { target: { value: '513' } });
          fireEvent.change(roomNameInput,
            { target: { value: 100 } });
        });
        context('when the user tries to exit the modal', function () {
          it('should show the unsaved changes warning', async function () {
            const windowConfirmStub = stub(window, 'confirm');
            windowConfirmStub.returns(true);
            // Attempt to close the modal without saving
            const cancelButton = await renderResult.findByText('Cancel');
            fireEvent.click(cancelButton);
            strictEqual(windowConfirmStub.callCount, 1);
          });
        });
        context('when the form is submitted', function () {
          it('should close the modal without an unsaved changes warning', async function () {
            const submitButton = renderResult.getByText('Submit');
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Submit'));
            const modal = renderResult.queryByRole('dialog');
            strictEqual(modal, null);
          });
          it('should show a success message', async function () {
            const submitButton = renderResult.getByText('Submit');
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Submit'));
            await waitForElementToBeRemoved(() => renderResult.queryByText('Fetching Room Data'));
            return renderResult.findByText('Room was updated', { exact: false });
          });
        });
      });
    });
  });
});
