import type { User } from '@types'
import { Service } from '@utils/apiRequest';

class UserService extends Service<User> {}

export const userService = new UserService('/user')