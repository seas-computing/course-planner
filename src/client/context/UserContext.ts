import { createContext, Context } from 'react';
import { User } from 'common/classes';

/**
 * Manage the currently logged-in user throught Context
 */

export const UserContext: Context<User> = createContext<User>(null);
