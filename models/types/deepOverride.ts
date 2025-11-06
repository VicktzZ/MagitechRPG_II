export type DeepOverride<Base, Override> = {
    [K in keyof Base]: K extends keyof Override
      ? Override[K] extends object
        ? Base[K] extends object
          ? DeepOverride<Base[K], Override[K]>
          : Override[K]
        : Override[K]
      : Base[K]
  } & Omit<Override, keyof Base>