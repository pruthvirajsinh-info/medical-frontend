import { baseApi } from "./baseApi";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query({
      query: (receiverId: string) => `/chat/history/${receiverId}`,
      providesTags: (result, error, receiverId) => [{ type: 'Messages', id: receiverId }],
    }),
  }),
});

export const { useGetChatHistoryQuery } = chatApi;
