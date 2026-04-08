import { motion } from "framer-motion";

const variantClasses = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-300",
  secondary:
    "border border-brand-300 bg-transparent text-brand-900 hover:bg-brand-100 focus-visible:ring-brand-300",
  ghost:
    "bg-brand-50 text-brand-900 hover:bg-brand-100 focus-visible:ring-brand-300",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  as = "button",
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 ${variantClasses[variant] || variantClasses.primary} ${className}`;

  if (as === "a") {
    return (
      <motion.a whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className={classes} {...props}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className={classes} {...props}>
      {children}
    </motion.button>
  );
}
