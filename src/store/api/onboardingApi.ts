import { baseApi } from "./baseApi";

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDraft: builder.query({
      query: () => "/onboarding/draft",
      providesTags: ["Onboarding"],
    }),
    updateDraft: builder.mutation({
      query: ({ step, data }) => ({
        url: "/onboarding/draft",
        method: "PUT",
        body: { step, data },
      }),
      invalidatesTags: ["Onboarding"],
    }),
    submitOnboarding: builder.mutation({
      query: () => ({
        url: "/onboarding/submit",
        method: "POST",
      }),
      invalidatesTags: ["Onboarding", "User"],
    }),
    getDoctors: builder.query({
      query: () => "/doctors",
    }),
  }),
});

export const {
  useGetDraftQuery,
  useUpdateDraftMutation,
  useSubmitOnboardingMutation,
  useGetDoctorsQuery,
} = onboardingApi;
