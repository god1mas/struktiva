import type { StableElementId } from "../core";

const BASE_ADDRESS = 0xa100;
const ADDRESS_STRIDE = 0x10;

export function getSimulatedAddress(id: StableElementId): string {
  const ordinal = Number.parseInt(id.replace(/^node-/, ""), 10);
  const safeOrdinal = Number.isInteger(ordinal) && ordinal >= 0 ? ordinal : 0;
  return `0x${(BASE_ADDRESS + safeOrdinal * ADDRESS_STRIDE)
    .toString(16)
    .toUpperCase()}`;
}
