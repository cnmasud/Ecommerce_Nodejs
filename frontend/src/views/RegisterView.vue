<script>
import axios from "axios";
import { useNotificationStore } from "@/stores/notification";

export default {
  setup() {
    const notification = useNotificationStore();
    return { notification };
  },

  data() {
    return {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      loading: false,
      errorMessage: "",
    };
  },

  methods: {
    async register() {
      this.errorMessage = "";

      if (!this.username || !this.email || !this.password) {
        this.errorMessage = "All fields are required.";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match.";
        return;
      }

      if (this.password.length < 6) {
        this.errorMessage = "Password must be at least 6 characters.";
        return;
      }

      this.loading = true;

      try {
        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "post",
          url: "/user/register",
          data: {
            username: this.username,
            email: this.email,
            password: this.password,
          },
        });

        this.notification.success("Account created! Please sign in.");
        // Only redirect on success
        this.$router.push("/login");
      } catch (e) {
        const msg = e.response?.data?.message || "Registration failed. Please try again.";
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
            <div class="text-5xl mb-3">📝</div>
            <h1 class="text-2xl font-bold">Create Account</h1>
            <p class="text-base-content/60 mt-1">Join our marketplace today</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="register" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Username</span>
              </label>
              <input
                v-model="username"
                type="text"
                placeholder="johndoe"
                class="input input-bordered w-full"
                autocomplete="username"
                required
              />
            </div>

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
                placeholder="Min. 6 characters"
                class="input input-bordered w-full"
                autocomplete="new-password"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Confirm Password</span>
              </label>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                class="input input-bordered w-full"
                autocomplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full mt-2"
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner"></span>
              <span v-else>Create Account</span>
            </button>
          </form>

          <!-- Footer Links -->
          <div class="text-center mt-4 text-sm">
            <p>
              Already have an account?
              <router-link to="/login" class="text-primary font-semibold hover:underline">
                Sign in here
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
