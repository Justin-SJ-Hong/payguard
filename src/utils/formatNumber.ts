const formatNumber = (value: number | string): string => {
  const number = Number(value);
  return isNaN(number) ? "" : number.toLocaleString();
};

export default formatNumber; 