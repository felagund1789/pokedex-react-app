import { ReactNode } from "react";
import "./Generation.css";

interface Props {
  children: ReactNode;
}

const Generation = ({ children }: Props) => {
  return (
    <div className="generation-container">
      <h3 className="generation">{children}</h3>
    </div>
  );
};

export default Generation;
