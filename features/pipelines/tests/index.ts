import { createMock } from 'ts-auto-mock'
import type { EffectContext } from '../types/effectContext'

const mockEffectContext = createMock<EffectContext>()

console.log(mockEffectContext)