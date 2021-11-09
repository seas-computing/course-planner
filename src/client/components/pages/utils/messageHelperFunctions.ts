import { MESSAGE_TYPE } from 'client/classes';
import { VARIANT } from 'mark-one';

/**
 * Finds the corresponding variant of type VARIANT corresponding to the
 * given message type
 */
const messageTypeToVariant = (messageType: MESSAGE_TYPE): VARIANT => {
  switch (messageType) {
    case MESSAGE_TYPE.ERROR:
      return VARIANT.NEGATIVE;
    case MESSAGE_TYPE.SUCCESS:
      return VARIANT.POSITIVE;
    default:
      return VARIANT.INFO;
  }
};

export default messageTypeToVariant;
