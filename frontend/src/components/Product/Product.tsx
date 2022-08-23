import { useNavigate } from 'react-router-dom';
import { IImage } from 'src/types/product.type';
import { IUser } from 'src/types/user.type';
import timeForToday from 'src/utils/ago';
import { formatPrice } from 'src/utils/formatPrice';
import styled from 'styled-components';
import Icon from '../common/Icon/Icon';
import Image from '../common/Image/Image';

interface IProduct {
  id: number;
  createdAt: string;
  title: string;
  price: number;
  images: IImage[];
  user: IUser;
  views: number;
  likes: number;
  chatRoom: number;
  isView: boolean;
  isLike: boolean;
}

interface Props {
  product: IProduct;
}

function Product({ product }: Props) {
  const isExistence = (count: number): boolean => count > 0;
  const navigate = useNavigate();

  const onClickProduct = (e: React.MouseEvent<HTMLLIElement>) => {
    navigate(`/products/${product.id}`);
  };

  const onClickHeart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <Container onClick={onClickProduct}>
        <InfoWrapper>
          <Image src={product.images[0].url} box="lg" alt="product thumbnail image" />
          <InfoText>
            <Title>{product.title}</Title>
            <LocationAndTime>{timeForToday(product.createdAt)}</LocationAndTime>
            <Price>{formatPrice(product.price)}원</Price>
          </InfoText>
        </InfoWrapper>

        <InfoIconWrapper>
          {isExistence(product.chatRoom) && (
            <div>
              <InfoIcon>
                <Icon name="iconSpeechBubbleMini" strokeColor="grey100" />
              </InfoIcon>
              <InfoIconCount>{product.chatRoom}</InfoIconCount>
            </div>
          )}
          {isExistence(product.likes) && (
            <div>
              <InfoIcon>
                <Icon name="iconHeartMini" strokeColor="grey100" />
              </InfoIcon>
              <InfoIconCount>{product.likes}</InfoIconCount>
            </div>
          )}
        </InfoIconWrapper>
        <HeartIcon onClick={onClickHeart}>
          <Icon name="iconHeart" strokeColor="grey100" />
        </HeartIcon>
      </Container>
    </>
  );
}

export default Product;

const Container = styled.li`
  position: relative;

  height: 139px;

  border-bottom: 1px solid ${({ theme }) => theme.color.grey300};

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;
`;

const InfoWrapper = styled.div`
  width: 90%;
  height: 106px;

  display: flex;

  gap: 16px;
`;

const InfoText = styled.div`
  width: 100%;
  height: 76px;

  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoIconWrapper = styled.div`
  height: 24px;

  position: absolute;
  right: 16px;
  bottom: 16px;

  display: flex;
  align-items: center;
  justify-content: end;
  gap: 16px;

  div {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const HeartIcon = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;

  width: 24px;
  height: 24px;
`;

const InfoIcon = styled.div``;

const InfoIconCount = styled.div`
  ${({ theme }) => theme.fonts.linkSmall};
  color: ${({ theme }) => theme.color.grey100};
`;

const Title = styled.p`
  // TODO: 기기의 정보를 받아서 유동적으로 늘려주자. ellipsis 를 위해서
  width: 125px;

  ${({ theme }) => theme.fonts.linkMedium};

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const Price = styled.p`
  ${({ theme }) => theme.fonts.linkSmall};
`;
const LocationAndTime = styled.p`
  color: ${({ theme }) => theme.color.grey100};
  ${({ theme }) => theme.fonts.textSmall};
`;
