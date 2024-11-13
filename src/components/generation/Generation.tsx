import { ReactNode } from "react";
import "./Generation.css";

interface Props {
  children: ReactNode;
}

const Generation = ({ children }: Props) => {
  return <h3 className="generation">{children}</h3>;
};

export default Generation;
