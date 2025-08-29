import { create } from 'zustand';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    varsityId: string;
  };
  lastMessage: {
    text: string;
    time: string;
  };
  unreadCount: number;
}

interface ChatState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  sendMessage: (receiverId: string, text: string) => void;
  getMessages: (userId: string) => Message[];
  markAsRead: (conversationId: string) => void;
}

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: '1',
    user: {
      id: '22235103001',
      name: 'John Doe',
      varsityId: '22235103001'
    },
    lastMessage: {
      text: 'Is the phone still available?',
      time: '2:30 PM'
    },
    unreadCount: 2
  },
  {
    id: '2',
    user: {
      id: '22235103002',
      name: 'Jane Smith',
      varsityId: '22235103002'
    },
    lastMessage: {
      text: 'Thanks for the quick response!',
      time: '11:45 AM'
    },
    unreadCount: 0
  }
];

// Mock messages data
const mockMessages: { [key: string]: Message[] } = {
  '22235103001': [
    {
      id: '1',
      senderId: '22235103001',
      receiverId: 'current-user',
      text: 'Hi! I saw your iPhone listing',
      timestamp: '2024-01-16T14:00:00Z',
      isRead: true
    },
    {
      id: '2',
      senderId: 'current-user',
      receiverId: '22235103001',
      text: 'Yes, it\'s still available!',
      timestamp: '2024-01-16T14:05:00Z',
      isRead: true
    },
    {
      id: '3',
      senderId: '22235103001',
      receiverId: 'current-user',
      text: 'Is the phone still available?',
      timestamp: '2024-01-16T14:30:00Z',
      isRead: false
    }
  ],
  '22235103002': [
    {
      id: '4',
      senderId: '22235103002',
      receiverId: 'current-user',
      text: 'Interested in the programming books',
      timestamp: '2024-01-16T11:00:00Z',
      isRead: true
    },
    {
      id: '5',
      senderId: 'current-user',
      receiverId: '22235103002',
      text: 'Sure! They are in great condition',
      timestamp: '2024-01-16T11:30:00Z',
      isRead: true
    },
    {
      id: '6',
      senderId: '22235103002',
      receiverId: 'current-user',
      text: 'Thanks for the quick response!',
      timestamp: '2024-01-16T11:45:00Z',
      isRead: true
    }
  ]
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: mockConversations,
  messages: mockMessages,

  sendMessage: (receiverId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: receiverId,
      text: text,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    set(state => ({
      messages: {
        ...state.messages,
        [receiverId]: [...(state.messages[receiverId] || []), newMessage]
      }
    }));
  },

  getMessages: (userId: string) => {
    return get().messages[userId] || [];
  },

  markAsRead: (conversationId: string) => {
    set(state => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    }));
  }
}));