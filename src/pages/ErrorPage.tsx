import { useRouteError } from "react-router-dom";

interface RouteError {
  statusText?: string;
  message?: string;
}

function ErrorPage() {
  const error = useRouteError() as RouteError;
  console.error(error);

  return (
    <div style={{ padding: 20 }}>
      <h1>Oops! Something went wrong.</h1>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}

export default ErrorPage;
