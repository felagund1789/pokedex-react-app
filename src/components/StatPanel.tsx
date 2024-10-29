import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

const StatPanel = ({ title, children }: Props) => {
  return (
    <div className="stat-panel">
      <h4>{children}</h4>
      <p>{title}</p>
    </div>
  );
};

export default StatPanel;
