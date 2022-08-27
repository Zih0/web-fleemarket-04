import { AxiosError } from 'axios';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import {
  addProduct,
  deleteProduct,
  dislikeProduct,
  getProductById,
  getProductPagination,
  likeProduct,
  updateProduct,
  updateProductStatus,
} from 'src/api/product';
import { IServerError, IServerResponse } from 'src/types/api';
import { IPaginationResponse } from 'src/types/pagination.type';
import { IProductPreview, IProductDetail } from 'src/types/product.type';
import { PRODUCT } from './queryKey';

interface IProductParams {
  category: number;
  like?: boolean;
  sell?: boolean;
}

export const useProductDetail = (
  productId: number,
  options?: UseQueryOptions<IServerResponse<IProductDetail>, AxiosError<IServerError>>,
) =>
  useQuery<IServerResponse<IProductDetail>, AxiosError<IServerError>>(
    PRODUCT.PRODUCT_DETAIL(productId),
    () => getProductById(productId),
    options,
  );

export const useProductPagination = ({ category, like, sell }: IProductParams) =>
  useInfiniteQuery<IServerResponse<IPaginationResponse<IProductPreview>>, AxiosError<IServerError>>(
    PRODUCT.PRODUCT_CATEGORY_PAGE(category),
    ({ pageParam = 1 }) => getProductPagination({ page: pageParam, category, like, sell }),
    {
      getNextPageParam: (lastPage) => lastPage.data.nextPage || undefined,
    },
  );

export const useLikeProduct = (productId: number, category?: number) => {
  const queryClient = useQueryClient();
  return useMutation(() => likeProduct(productId), {
    onSuccess: () => {
      if (category) {
        queryClient.removeQueries(PRODUCT.PRODUCT_CATEGORY_PAGE(category));
      } else {
        queryClient.invalidateQueries(PRODUCT.PRODUCT_DETAIL(productId));
      }
    },
  });
};
export const useDisLikeProduct = (productId: number, category?: number) => {
  const queryClient = useQueryClient();

  return useMutation(() => dislikeProduct(productId), {
    onSuccess: () => {
      if (category) {
        queryClient.removeQueries(PRODUCT.PRODUCT_CATEGORY_PAGE(category));
      } else {
        queryClient.invalidateQueries(PRODUCT.PRODUCT_DETAIL(productId));
      }
    },
  });
};

export const useAddProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(addProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(PRODUCT.ALL);
    },
  });
};

export const useUpdateProductStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(updateProductStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(PRODUCT.ALL);
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(updateProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(PRODUCT.ALL);
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(PRODUCT.ALL);
    },
  });
};
