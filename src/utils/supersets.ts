import { createId } from './format';

/**
 * Una superserie es un tramo contiguo de ejercicios con el mismo
 * `supersetGroup`. Estas funciones mantienen ese invariante tras enlazar,
 * mover o borrar ejercicios.
 */
interface Groupable {
  supersetGroup?: string;
}

/** Tramos contiguos y de al menos 2 ejercicios; el resto, sin grupo. */
export function normalizeSupersets<T extends Groupable>(list: T[]): T[] {
  const seen = new Set<string>();
  // 1) Un mismo id en tramos separados: los tramos posteriores reciben id nuevo.
  const contiguous = list.map((item) => ({ ...item }));
  for (let i = 0; i < contiguous.length; i++) {
    const group = contiguous[i].supersetGroup;
    if (!group) continue;
    const continuesRun = i > 0 && contiguous[i - 1].supersetGroup === group;
    if (!continuesRun && seen.has(group)) {
      const fresh = createId();
      for (let j = i; j < contiguous.length && contiguous[j].supersetGroup === group; j++) {
        contiguous[j].supersetGroup = fresh;
      }
    }
    seen.add(contiguous[i].supersetGroup!);
  }
  // 2) Grupos de un solo ejercicio no son superserie.
  return contiguous.map((item, i) => {
    const group = item.supersetGroup;
    const linked =
      !!group &&
      (contiguous[i - 1]?.supersetGroup === group || contiguous[i + 1]?.supersetGroup === group);
    if (linked) return item;
    const { supersetGroup: _, ...rest } = item;
    return rest as T;
  });
}

export function isLinkedWithNext<T extends Groupable>(list: T[], index: number): boolean {
  const group = list[index]?.supersetGroup;
  return !!group && list[index + 1]?.supersetGroup === group;
}

/** Enlaza o separa el ejercicio `index` del siguiente. */
export function toggleLinkWithNext<T extends Groupable>(list: T[], index: number): T[] {
  if (index < 0 || index >= list.length - 1) return list;
  const next = list.map((item) => ({ ...item }));
  if (isLinkedWithNext(next, index)) {
    // Separar: lo que sigue a `index` en ese grupo pasa a un grupo nuevo.
    const group = next[index].supersetGroup;
    const fresh = createId();
    for (let j = index + 1; j < next.length && next[j].supersetGroup === group; j++) {
      next[j].supersetGroup = fresh;
    }
  } else {
    const group = next[index].supersetGroup ?? next[index + 1].supersetGroup ?? createId();
    const oldNextGroup = next[index + 1].supersetGroup;
    next[index].supersetGroup = group;
    // Si el siguiente ya estaba en otra superserie, se une entera.
    for (let j = index + 1; j < next.length; j++) {
      if (j > index + 1 && (!oldNextGroup || next[j].supersetGroup !== oldNextGroup)) break;
      next[j].supersetGroup = group;
    }
  }
  return normalizeSupersets(next);
}
