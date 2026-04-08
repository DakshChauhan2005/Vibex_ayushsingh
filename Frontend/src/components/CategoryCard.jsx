import { motion } from "framer-motion";
import Card from "./ui/Card";

export default function CategoryCard({ title, image, count, onClick }) {
  return (
    <motion.button type="button" onClick={onClick} whileHover={{ y: -6 }} className="w-full text-left">
      <Card className="group p-4 transition duration-200 hover:shadow-lg">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={image}
            alt={title}
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-800">
            {count}+ providers
          </span>
        </div>
        <h3 className="type-display mt-4 text-2xl font-extrabold text-brand-950">{title}</h3>
        <p className="mt-1 text-sm text-brand-700">Top rated local experts near you</p>
      </Card>
    </motion.button>
  );
}
