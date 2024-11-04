import "./Loading.css";

interface Props {
  isLoading: boolean;
}

const Loading = ({ isLoading }: Props) => {
  return <div className={`loading-bar ${isLoading ? "loading" : ""}`}></div>;
};

export default Loading;
