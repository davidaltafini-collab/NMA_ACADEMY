export const paymentService = {
  // Future API: POST /api/payments/checkout
  createCheckoutSession: async (courseSlug: string, discountCode?: string) => {
    // In a real app this calls the backend which communicates with Netopia
    return new Promise<{url: string; checkout_id: string}>((resolve) => 
      setTimeout(() => resolve({ 
        url: "/payment/pending", 
        checkout_id: "chk_" + Math.random().toString(36).substring(7) 
      }), 1000)
    );
  },
  // Future API: POST /api/payments/validate-discount
  validateDiscount: async (code: string) => {
    return new Promise<{valid: boolean; percentage: number}>((resolve) => {
      setTimeout(() => {
        if (code === "NMA20") {
          resolve({ valid: true, percentage: 20 });
        } else {
          resolve({ valid: false, percentage: 0 });
        }
      }, 500);
    });
  }
}
