<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";

import CreateShop from "@/components/dashboard/CreateShop.vue";
import ShopComponent from "@/components/dashboard/ShopComponent.vue";
import ProductList from "@/components/dashboard/ProductList.vue";

export default {
  props: {
    userID: {
      type: String,
      default: "",
    },
  },

  components: { CreateShop, ShopComponent, ProductList },

  setup() {
    const userStore = useUserStore();
    return { userStore };
  },

  data() {
    return {
      hasShop: false,
      shopID: null,
      dataLoaded: false,
      errorMessage: "",
    };
  },

  async created() {
    // Guard: redirect to login if not logged in
    if (!this.userID || !this.userStore.getToken) {
      this.$router.push("/login");
      return;
    }

    try {
      const res = await axios({
        baseURL: import.meta.env.VITE_BACKENDURL,
        method: "get",
        url: "/user/show",
        params: { userID: this.userID },
        headers: { Authorization: `Bearer ${this.userStore.getToken}` },
      });

      if (res.data.shop) {
        this.hasShop = true;
        this.shopID = res.data.shop;
      }
    } catch (e) {
      this.errorMessage = e.response?.data?.message || "Failed to load dashboard.";
      console.error("Dashboard load error:", e);
    } finally {
      this.dataLoaded = true;
    }
  },
};
</script>

<template>
  <div class="py-2">
    <!-- Loading -->
    <div v-if="!dataLoaded" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="alert alert-error">
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Dashboard content -->
    <template v-else>
      <CreateShop v-if="!hasShop" :userID="userID" />
      <template v-if="hasShop">
        <ShopComponent :userID="userID" :shopID="shopID" />
        <ProductList :userID="userID" :shopID="shopID" />
      </template>
    </template>
  </div>
</template>
