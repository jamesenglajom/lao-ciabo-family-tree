"use client";

import { useEffect, useRef } from "react";
import * as f3 from "family-chart";
import "family-chart/styles/family-chart.css";

export function FamilyChartTree({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !data?.length) return;

    const chart = f3.createChart(el, data);

    chart
      .setTransitionTime(600)
      .setCardYSpacing(140)
      .setCardXSpacing(180)
      .setOrientationVertical();

    chart
      .setCardHtml()
      .setCardDisplay([["name"], ["birthday"]])
      .setStyle("imageCircleRect")
      .setCardImageField("avatar")
      .setMiniTree(true)
      .setOnHoverPathToMain();

    chart.setPersonDropdown((datum) => datum.data.name, {
      placeholder: "Jump to a family member",
    });

    chart.updateTree({ initial: true });

    return () => {
      el.replaceChildren();
    };
  }, [data]);

  if (!data?.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium text-ink">No family members yet</p>
        <p className="max-w-sm text-xs text-ink-faint">
          Add members from the admin panel to see the tree here.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Eng and Ciabo family tree rendered with family-chart"
      className="f3 h-full w-full"
    />
  );
}
