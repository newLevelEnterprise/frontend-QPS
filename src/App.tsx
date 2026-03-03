import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Router from "./router";
import AppErrorBoundary from "./ui/components/AppErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <Router />
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
