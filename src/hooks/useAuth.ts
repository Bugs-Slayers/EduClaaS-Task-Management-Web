import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import type { LoginRequest, RegisterRequest } from "@/types";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      const { user, token } = res.data.data!;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? "Login failed");
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (res) => {
      const { user, token } = res.data.data!;
      setAuth(user, token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? "Registration failed");
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return () => {
    clearAuth();
    qc.clear();
    navigate("/login");
    toast.success("Logged out successfully");
  };
}

export function useProfile() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getProfile().then((r) => r.data.data!),
    enabled: isAuthenticated,
  });
}
