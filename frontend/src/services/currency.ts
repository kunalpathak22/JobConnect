export const getCurrencySymbol = (currency: string) => {
  return currency === 'INR' ? '₹' : '$';
};

export const formatSalary = (salary: number | null | undefined, currency: string) => {
  if (!salary) return 'Salary Disclosed';
  if (currency === 'INR') {
    return `₹${(salary * 83).toLocaleString('en-IN')}/yr`;
  }
  return `$${salary.toLocaleString('en-US')}/yr`;
};
