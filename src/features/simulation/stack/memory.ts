const STACK_BASE_ADDRESS = 0xc100;
const INTEGER_BYTES = 4;

export function getStackSimulatedAddress(slot: number): string {
  if (!Number.isInteger(slot) || slot < 0) {
    throw new Error("Slot alamat simulasi harus berupa bilangan bulat non-negatif.");
  }
  return `0x${(STACK_BASE_ADDRESS + slot * INTEGER_BYTES)
    .toString(16)
    .toUpperCase()}`;
}
