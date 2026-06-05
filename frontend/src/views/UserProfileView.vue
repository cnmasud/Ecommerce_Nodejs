<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";

export default {
  props: {
    userID: {
      type: String,
      default: "",
    },
  },

  setup() {
    const userStore = useUserStore();
    const notification = useNotificationStore();
    return { userStore, notification };
  },

  data() {
    return {
      loading: false,
      saving: false,
      avatarFile: null,
      user: {
        name: "",
        username: "",
        email: "",
        phone: "",
        avatar: "",
        address: {
          country: "",
          province: "",
          city: "",
          postCode: "",
          street: "",
        },
      },
      errorMessage: "",
    };
  },

  async created() {
    if (this.userID) {
      await this.fetchUser();
    }
  },

  methods: {
    async fetchUser() {
      this.loading = true;
      try {
        const res = await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "get",
          url: "/user/show",
          params: { userID: this.userID },
          headers: { Authorization: `Bearer ${this.userStore.getToken}` },
        });
        const data = res.data;
        this.user.name = data.name || "";
        this.user.username = data.username || "";
        this.user.email = data.email || "";
        this.user.phone = data.phone || "";
        this.user.avatar = data.avatar || "";
        if (data.address) {
          this.user.address = { ...data.address };
        }
      } catch (e) {
        this.errorMessage = e.response?.data?.message || "Failed to load profile.";
      } finally {
        this.loading = false;
      }
    },

    onAvatarChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.avatarFile = file;
        this.user.avatar = URL.createObjectURL(file);
      }
    },

    async saveProfile() {
      this.saving = true;
      this.errorMessage = "";
      try {
        const formData = new FormData();
        formData.append("name", this.user.name);
        formData.append("username", this.user.username);
        formData.append("email", this.user.email);
        formData.append("phone", this.user.phone);
        formData.append("country", this.user.address.country);
        formData.append("province", this.user.address.province);
        formData.append("city", this.user.address.city);
        formData.append("postCode", this.user.address.postCode);
        formData.append("street", this.user.address.street);
        if (this.avatarFile) {
          formData.append("avatar", this.avatarFile);
        }

        await axios({
          baseURL: import.meta.env.VITE_BACKENDURL,
          method: "put",
          url: "/user/update",
          params: { userID: this.userID },
          data: formData,
          headers: {
            Authorization: `Bearer ${this.userStore.getToken}`,
            "Content-Type": "multipart/form-data",
          },
        });

        this.notification.success("Profile updated successfully!");
        // Reload user profile data without full page reload
        await this.fetchUser();
      } catch (e) {
        const msg = e.response?.data?.message || "Failed to update profile.";
        this.errorMessage = msg;
        this.notification.error(msg);
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<template>
  <div class="max-w-2xl mx-auto py-4 px-2 md:px-0">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-6">My Profile</h1>

      <!-- Error -->
      <div v-if="errorMessage" class="alert alert-error mb-4">
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Avatar section -->
      <div class="flex items-center gap-4 mb-6">
        <div class="avatar">
          <div class="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img
              :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user.username || 'user')"
              :alt="user.username"
            />
          </div>
        </div>
        <div>
          <label class="btn btn-outline btn-sm cursor-pointer">
            Change Avatar
            <input type="file" class="hidden" accept="image/*" @change="onAvatarChange" />
          </label>
          <p class="text-xs text-base-content/50 mt-1">JPG, PNG or GIF. Max 5MB.</p>
        </div>
      </div>

      <!-- Profile Form -->
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Full Name</span></label>
            <input v-model="user.name" type="text" class="input input-bordered" placeholder="John Doe" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Username</span></label>
            <input v-model="user.username" type="text" class="input input-bordered" placeholder="johndoe" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Email</span></label>
            <input v-model="user.email" type="email" class="input input-bordered" placeholder="you@example.com" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Phone</span></label>
            <input v-model="user.phone" type="tel" class="input input-bordered" placeholder="+1 555 000 0000" />
          </div>
        </div>

        <div class="divider">Address</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Country</span></label>
            <input v-model="user.address.country" type="text" class="input input-bordered" placeholder="USA" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Province / State</span></label>
            <input v-model="user.address.province" type="text" class="input input-bordered" placeholder="California" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">City</span></label>
            <input v-model="user.address.city" type="text" class="input input-bordered" placeholder="Los Angeles" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Post Code</span></label>
            <input v-model="user.address.postCode" type="text" class="input input-bordered" placeholder="90001" />
          </div>
          <div class="form-control md:col-span-2">
            <label class="label"><span class="label-text">Street Address</span></label>
            <input v-model="user.address.street" type="text" class="input input-bordered" placeholder="123 Main St" />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="loading loading-spinner"></span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
