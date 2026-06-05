<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification";

export default {
  setup() {
    const userStore = useUserStore();
    const cartStore = useCartStore();
    const notification = useNotificationStore();
    return { userStore, cartStore, notification };
  },

  data() {
    return {
      email: "",
      password: "",
      loading: false,
      errorMessage: "",
    };
  },

  methods: {
    async login() {
      if (!this.email || !this.password) {
        this.errorMessage = "Please enter your email and password.";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "post",
          url: "/user/login",
          data: {
            email: this.email,
            password: this.password,
          },
        });

        // Handle both legacy (bare token string) and new ({ success, token }) formats
        const token = response.data?.token ?? response.data;
        if (!token || typeof token !== "string") {
          this.errorMessage = "Login failed: Invalid server response.";
          return;
        }

        await this.userStore.setToken(token);

        // Sync guest cart with backend
        await this.cartStore.syncWithBackend();

        this.notification.success("Welcome back! Logged in successfully.");

        // Navigate to previous page or home (SPA-friendly, no full reload)
        const redirect = this.$route.query.redirect || "/";
        this.$router.push(redirect);
      } catch (e) {
        const msg = e.response?.data?.message || "Invalid email or password.";
        this.errorMessage = msg;
        this.notification.error(msg);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-6 md:p-8">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">🔐</div>
            <h1 class="text-2xl font-bold">Welcome Back</h1>
            <p class="text-base-content/60 mt-1">Sign in to your account</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="login" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Email</span>
              </label>
              <input
                v-model="email"
                type="email"
                placeholder="you@example.com"
                class="input input-bordered w-full"
                autocomplete="email"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Password</span>
              </label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="input input-bordered w-full"
                autocomplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full mt-2"
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner"></span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <!-- Footer Links -->
          <div class="text-center mt-4 text-sm">
            <p>
              Don't have an account?
              <router-link to="/register" class="text-primary font-semibold hover:underline">
                Register here
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
