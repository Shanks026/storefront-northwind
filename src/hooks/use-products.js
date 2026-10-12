import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getProduct, getRelatedProducts, listProducts } from "@/api/products"
import { askQuestion, listMyQuestions } from "@/api/questions"
import { getProductQuestions, getProductReviews } from "@/api/reviews"
import { useSession } from "@/hooks/use-auth"

export const productKeys = {
  all: ["products"],
  list: (filters) => ["products", filters],
  detail: (slug) => ["product", slug],
  related: (slug) => ["product", slug, "related"],
  reviews: (slug) => ["product", slug, "reviews"],
  questions: (slug) => ["product", slug, "questions"],
}

/** Keeps the previous grid on screen while a new filter combination loads. */
export function useProducts(filters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => listProducts(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(slug) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug),
  })
}

export function useRelatedProducts(slug) {
  return useQuery({
    queryKey: productKeys.related(slug),
    queryFn: () => getRelatedProducts(slug),
    enabled: Boolean(slug),
  })
}

export function useProductReviews(slug) {
  return useQuery({ queryKey: productKeys.reviews(slug), queryFn: () => getProductReviews(slug), enabled: Boolean(slug), staleTime: Infinity })
}

export function useProductQuestions(slug) {
  return useQuery({ queryKey: productKeys.questions(slug), queryFn: () => getProductQuestions(slug), enabled: Boolean(slug), staleTime: Infinity })
}

export const myQuestionsKey = (slug) => ["my-questions", slug]

/** Questions the signed-in user has asked about this product (pending vendor answers). */
export function useMyQuestions(slug) {
  const { isAuthenticated } = useSession()
  return useQuery({ queryKey: myQuestionsKey(slug), queryFn: () => listMyQuestions(slug), enabled: isAuthenticated && Boolean(slug) })
}

export function useAskQuestion(slug) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (question) => askQuestion({ slug, question }),
    onSuccess: (row) => queryClient.setQueryData(myQuestionsKey(slug), (rows = []) => [row, ...rows]),
  })
}
