"use client";

import { useEffect } from "react";

/**
 * Marks <html> with the current section so the theme tokens for that section
 * apply to the whole chrome, header and footer included. The root layout's head script stamps it for the
 * first paint of a hard load; this keeps client navigations and unmounts in sync.
 */
export default function SectionScope({ name }: { name: string }) {
  useEffect(() => {
    document.documentElement.dataset.section = name;
    return () => {
      delete document.documentElement.dataset.section;
    };
  }, [name]);

  return null;
}
