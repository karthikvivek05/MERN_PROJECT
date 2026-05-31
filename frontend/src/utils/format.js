export const formatPrice = (price) => {
  const num = Number(price);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
};
