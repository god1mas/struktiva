const ARRAY_BASE_ADDRESS = 0xb100;
const INTEGER_BYTES = 4;

export function getArraySimulatedAddress(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Index alamat simulasi harus berupa bilangan bulat non-negatif.");
  }
  return `0x${(ARRAY_BASE_ADDRESS + index * INTEGER_BYTES)
    .toString(16)
    .toUpperCase()}`;
}
