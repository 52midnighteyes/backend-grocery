function makeCode(value: string, length = 3) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, length)
    .padEnd(length, "X");
}

function normalizeSize(value: string) {
  return value
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace("LITER", "L")
    .replace("GRAM", "G")
    .replace("KILOGRAM", "KG");
}

export function generateSku(input: {
  category: string;
  brand?: string | null;
  productName: string;
  variant?: string | null;
  size?: string | null;
}) {
  const categoryCode = makeCode(input.category, 3);
  const brandCode = input.brand ? makeCode(input.brand, 3) : "NOB";
  const productCode = makeCode(input.productName, 3);
  const variantCode = input.variant ? makeCode(input.variant, 3) : "STD";
  const sizeCode = input.size ? normalizeSize(input.size) : "NOSIZE";

  return [categoryCode, brandCode, productCode, variantCode, sizeCode].join(
    "-"
  );
}
