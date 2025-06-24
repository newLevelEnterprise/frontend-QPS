import AuthProvider from "../../contexts/AuthContext";
import LoginForm from "../components/forms/Loginform";

function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}

export default LoginPage;
