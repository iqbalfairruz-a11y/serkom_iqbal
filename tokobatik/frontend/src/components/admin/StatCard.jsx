import React from "react";

export default function StatCard({ title, value, subtitle, borderColor = "border-warning" }) {
  return (
    <div className={`card border-0 border-start border-4 ${borderColor} shadow-sm p-3 bg-white h-100`}>
      <div className="text-secondary small fw-bold text-uppercase">{title}</div>
      <div className="fs-2 fw-bold my-1 text-dark">{value}</div>
      {subtitle && <div className="text-muted small">{subtitle}</div>}
    </div>
  );
}