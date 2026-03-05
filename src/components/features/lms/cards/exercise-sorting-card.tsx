"use client";

import { useState } from "react";
import { Reorder, motion } from "framer-motion";

type SortItem = {
  id: string;
  label: string;
};

type ExerciseSortingCardProps = {
  instruction: string;
  items: SortItem[];
  onSubmit: (orderedIds: string[]) => void;
};

export function ExerciseSortingCard({
  instruction,
  items: initialItems,
  onSubmit,
}: ExerciseSortingCardProps) {
  const [items, setItems] = useState(initialItems);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setSubmitted(true);
    onSubmit(items.map((item) => item.id));
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-off-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-2xl flex-col gap-6"
      >
        <h2 className="font-heading text-xl font-bold text-navy md:text-2xl">
          {instruction}
        </h2>
        <p className="text-sm text-charcoal">
          Dra och släpp för att ändra ordningen
        </p>

        <Reorder.Group
          axis="y"
          values={items}
          onReorder={submitted ? () => {} : setItems}
          className="flex flex-col gap-3"
        >
          {items.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className={`
                flex cursor-grab items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm
                transition-shadow active:cursor-grabbing active:shadow-md
                ${submitted ? "pointer-events-none opacity-80" : ""}
              `}
            >
              {/* Drag handle */}
              <span
                className="flex flex-col gap-0.5 text-light-gray"
                aria-hidden="true"
              >
                <span className="block h-0.5 w-4 rounded bg-current" />
                <span className="block h-0.5 w-4 rounded bg-current" />
                <span className="block h-0.5 w-4 rounded bg-current" />
              </span>

              {/* Rank number */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
                {index + 1}
              </span>

              <span className="text-base font-medium text-navy">
                {item.label}
              </span>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitted}
          className="self-end rounded-[3rem] bg-primary px-8 py-3 font-heading text-base font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitted ? "Skickat" : "Bekräfta ordning"}
        </button>
      </motion.div>
    </div>
  );
}
