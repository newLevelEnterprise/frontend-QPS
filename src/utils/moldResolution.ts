import type { IMoldes } from "../types/Moldes";

export function uniqueProductsFromMolds(moldes?: IMoldes[]) {
  const products = new Map<number, { id: number; name: string }>();
  moldes?.forEach((molde) => {
    molde.products.forEach((product) => {
      products.set(product.id, product);
    });
  });
  return Array.from(products.values());
}

export function findMoldForProduct(
  moldes: IMoldes[] | undefined,
  productId: string,
) {
  if (!productId) return undefined;
  return moldes?.find((molde) =>
    molde.products.some((product) => String(product.id) === productId),
  );
}

export function findMoldByProductName(
  moldes: IMoldes[] | undefined,
  productName: string,
) {
  if (!productName) return undefined;
  return moldes?.find((molde) =>
    molde.products.some((product) => product.name === productName),
  );
}