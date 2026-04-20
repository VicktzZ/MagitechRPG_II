import type { User } from '@models/entities';
import { Service } from '@utils/apiRequest';

class UserService extends Service<User> {}

export const userService = new UserService('/user')