import {
  BoundFunction,
  fireEvent,
  GetByText,
  QueryByText,
  wait,
} from '@testing-library/react';
import { strictEqual } from 'assert';
import { TERM } from 'common/constants';
import { TermKey } from 'common/constants/term';
import React from 'react';
import { SinonStub, stub } from 'sinon';
import { render } from 'test-utils';
import { cs50CourseInstance } from 'testData';
import MeetingModal from '../MeetingModal';

describe('Meeting Modal', function () {
  describe('rendering', function () {
    let getByText: BoundFunction<GetByText>;
    let queryByText: BoundFunction<QueryByText>;
    let onCloseStub: SinonStub;
    const dispatchMessage: SinonStub = stub();
    const meetingTerm = TERM.FALL;
    const semKey = meetingTerm.toLowerCase() as TermKey;
    beforeEach(function () {
      onCloseStub = stub();
      ({ getByText, queryByText } = render(
        <MeetingModal
          isVisible
          currentCourseInstance={{
            course: cs50CourseInstance,
            term: meetingTerm,
          }}
          onClose={onCloseStub}
        />,
        dispatchMessage
      ));
    });
    describe('On Open Behavior', function () {
      it('populates the heading with the correct course instance information', function () {
        strictEqual(
          !!queryByText(
            `Rooms for ${cs50CourseInstance.catalogNumber} - ${cs50CourseInstance.title} - ${meetingTerm} ${cs50CourseInstance[semKey].calendarYear}`
          ),
          true
        );
      });
    });
    describe('On Close Behavior', function () {
      it('calls the onClose handler once', async function () {
        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);
        await wait(() => !queryByText(/Rooms for/));
        await wait(() => strictEqual(onCloseStub.callCount, 1));
      });
    });
  });
});
