"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import * as gtag from "../lib/gtag";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const search = searchParams.toString();
    const url = search ? `${pathname}?${search}` : pathname;

    gtag.pageview(url);
  }, [pathname, searchParams]);

  return null;
}
