import Header from 'src/components/common/Header/Header';
import Icon from 'src/components/common/Icon/Icon';
import ChatWindow from 'src/components/ChatRoom/ChatWindow';
import ChatInput from 'src/components/ChatRoom/ChatInput';
import ChatProduct from 'src/components/ChatRoom/ChatProduct';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatRoomQuery, useDeleteChatRoomMutation } from 'src/queries/chatRoom';
import withAuth from 'src/hocs/withAuth';
import { useLoggedIn } from 'src/contexts/LoggedInContext';
import { useEffect, useState } from 'react';
import { useSocket } from 'src/hooks/useSocket';
import { IMessage } from 'src/types/chatRoom';
import { useUserInfo } from 'src/queries/user';
import { useModalContext } from 'src/contexts/ModalContext';
import { useToast } from 'src/contexts/ToastContext';

function Chat() {
  const { isLoggedIn } = useLoggedIn();
  const { data: userInfo } = useUserInfo();

  const modal = useModalContext();

  const chatRoomId = useParams<{ chatRoomId: string }>().chatRoomId as string;
  const { data: chatRoom, isLoading } = useChatRoomQuery(chatRoomId, {
    enabled: isLoggedIn && !!chatRoomId,
    cacheTime: 0,
  });
  const [newChatLog, setNewChatLog] = useState<IMessage[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const deleteChatRoomMutation = useDeleteChatRoomMutation();
  const toast = useToast();

  const { socket, sendMessage } = useSocket(chatRoomId);

  useEffect(() => {
    socket?.on(chatRoomId, (res) => {
      setNewChatLog((prev) => [...prev, res]);
    });
  }, [socket]);

  useEffect(() => {
    modal.setTitle('채팅방을 나가면 채팅 목록 및 대화 내용이 삭제 되고 복구할 수 없어요. 😂 채팅방에서 나가시겠어요? ');
    modal.setOnOk(() => {
      deleteChatRoomMutation.mutate(chatRoomId, {
        onSuccess: () => {
          navigate(-1);
          toast.success('해당 채팅방이 삭제되었습니다.');
        },
      });
      modal.onClose();
    });
  }, []);

  const onClickBack = () => navigate(-1);

  const onChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.currentTarget.value);
  };

  const onClickSubmit = (): void => {
    if (!message.trim()) return;
    sendMessage({
      chatRoomId,
      content: message,
      senderId: userInfo?.data.id,
    });
    setMessage('');
  };
  if (isLoading) return null;
  if (!chatRoom) return null;
  const {
    product,
    messages,
    partner: { nickname },
  } = chatRoom.data.chatRoom;
  return (
    <>
      <Header
        headerTheme="white"
        left={<Icon name="iconChevronLeft" strokeColor="black" onClick={onClickBack} />}
        center={<p>{nickname}</p>}
        right={<Icon name="iconOut" strokeColor="red" onClick={modal.onOpen} />}
      />

      <ChatProduct product={product} />

      <ChatWindow messages={messages} newChatLog={newChatLog} />

      <ChatInput message={message} onChangeMessage={onChangeMessage} onClickSubmit={onClickSubmit} />
    </>
  );
}

export default withAuth(Chat);
