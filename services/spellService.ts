import type { Spell } from '@models/entities';
import type { SearchOptions } from '@enums';
import { Service } from '@utils/apiRequest';

class SpellService extends Service<Spell, SearchOptions> {}

export const spellService = new SpellService('/spell');
