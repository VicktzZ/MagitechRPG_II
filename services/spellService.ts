import type { Magia } from '@types';
import type { SearchOptions } from '@enums';
import { Service } from '@utils/apiRequest';

class MagiaService extends Service<Magia, SearchOptions> {}

export const magiaService = new MagiaService('/spell');
